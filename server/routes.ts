import type { Express } from "express";
import { sql } from "drizzle-orm";
import type { Server } from "http";
import { storage } from "./storage";
import * as auth from "./auth_db";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { db, pool } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // configure cloudinary from environment
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const upload = multer({ storage: multer.memoryStorage() });

  // Image upload endpoint used by admin UI. Expects multipart/form-data with `file` field.
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file provided" });
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res.status(500).json({ message: "Cloudinary not configured" });
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "pawan-gems" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message: "Upload failed" });
          }
          return res.json({ url: result?.secure_url });
        }
      );

      // pipe buffer to upload_stream
      stream.end(req.file.buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create an order request (user)
  app.post("/api/order-requests", async (req, res) => {
    try {
      const userId = await auth.getUserIdBySession(req.cookies.sessionId);
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const { productId, quantity, message } = req.body;
      const result = await pool.query(
        "INSERT INTO order_requests (user_id, product_id, quantity, message) VALUES ($1,$2,$3,$4) RETURNING *",
        [userId, productId, quantity || 1, message || null]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal" });
    }
  });

  // List current user's order requests
  app.get("/api/order-requests", async (req, res) => {
    try {
      const userId = await auth.getUserIdBySession(req.cookies.sessionId);
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const result = await pool.query(
        `SELECT orr.*, p.name as product_name, p.image_url as product_image
         FROM order_requests orr
         JOIN products p ON p.id = orr.product_id
         WHERE orr.user_id = $1
         ORDER BY orr.created_at DESC`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal" });
    }
  });

  // Admin: list all order requests
  app.get("/api/admin/order-requests", async (req, res) => {
    try {
      const userId = await auth.getUserIdBySession(req.cookies.sessionId);
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await pool.query(
        "SELECT is_admin FROM users WHERE id = $1",
        [userId]
      );
      if (!user.rows[0] || !user.rows[0].is_admin)
        return res.status(403).json({ error: "forbidden" });
      const result = await pool.query(
        `SELECT orr.*, p.name as product_name, p.image_url as product_image, u.name as user_name, u.email as user_email
         FROM order_requests orr
         JOIN products p ON p.id = orr.product_id
         JOIN users u ON u.id = orr.user_id
         ORDER BY orr.created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal" });
    }
  });

  // Admin: accept or decline request
  app.post("/api/admin/order-requests/:id/decide", async (req, res) => {
    try {
      const userId = await auth.getUserIdBySession(req.cookies.sessionId);
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await pool.query(
        "SELECT is_admin FROM users WHERE id = $1",
        [userId]
      );
      if (!user.rows[0] || !user.rows[0].is_admin)
        return res.status(403).json({ error: "forbidden" });
      const id = req.params.id;
      const { decision, adminMessage } = req.body; // decision: 'accepted' | 'declined'
      if (!["accepted", "declined"].includes(decision))
        return res.status(400).json({ error: "invalid decision" });
      const result = await pool.query(
        "UPDATE order_requests SET status = $1, admin_message = $2 WHERE id = $3 RETURNING *",
        [decision, adminMessage, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal" });
    }
  });
  // Products API
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const input = api.products.update.input.parse(req.body);
      // Verify product exists
      const existing = await storage.getProduct(id);
      if (!existing)
        return res.status(404).json({ message: "Product not found" });

      const product = await storage.updateProduct(id, input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await storage.getProduct(id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // Seed Data Endpoint (Internal use or auto-run)
  // We'll run this check on startup
  seedDatabase();

  // Auth endpoints (simple in-memory auth + session cookie)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ message: "Missing fields" });
      // basic server-side validation
      if (typeof password !== "string" || password.length < 6)
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      try {
        const user = await auth.createUser(name, email, password);
        const sessionId = await auth.createSession(user.id);
        res.cookie("sessionId", sessionId, { httpOnly: true, sameSite: "lax" });
        return res.status(201).json(user);
      } catch (err: any) {
        return res
          .status(400)
          .json({ message: err.message || "Registration failed" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Missing fields" });
      const user = await auth.verifyPassword(email, password);
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
      const sessionId = await auth.createSession(user.id);
      res.cookie("sessionId", sessionId, { httpOnly: true, sameSite: "lax" });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers["x-session-id"];
    await auth.destroySession(sessionId as string | undefined);
    res.clearCookie("sessionId");
    res.json({ ok: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers["x-session-id"];
    const userId = await auth.getUserIdBySession(
      sessionId as string | undefined
    );
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await auth.getUserById(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    res.json(user);
  });

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    console.log("Seeding database...");
    await storage.createProduct({
      name: "The Royal Emerald Necklace",
      description:
        "A stunning masterpiece featuring a 5-carat Colombian emerald surrounded by diamonds.",
      price: 1500000, // $15,000.00
      imageUrl:
        "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2574&auto=format&fit=crop",
      category: "Necklaces",
      isFeatured: true,
    });
    await storage.createProduct({
      name: "Sapphire Drop Earrings",
      description:
        "Elegant drop earrings with deep blue sapphires set in 18k white gold.",
      price: 450000, // $4,500.00
      imageUrl:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2683&auto=format&fit=crop",
      category: "Earrings",
      isFeatured: true,
    });
    await storage.createProduct({
      name: "Vintage Gold Signet Ring",
      description:
        "A classic heirlooom piece. 24k solid gold with intricate engraving.",
      price: 220000, // $2,200.00
      imageUrl:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2670&auto=format&fit=crop",
      category: "Rings",
      isFeatured: false,
    });
    await storage.createProduct({
      name: "Diamond Tennis Bracelet",
      description: "Timeless elegance. 3 carats of brilliant cut diamonds.",
      price: 850000, // $8,500.00
      imageUrl:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop",
      category: "Bracelets",
      isFeatured: true,
    });
    console.log("Database seeded!");
  }
}
