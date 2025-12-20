import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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
      return res.status(404).json({ message: 'Product not found' });
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
      if (!existing) return res.status(404).json({ message: "Product not found" });

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
    if (!existing) return res.status(404).json({ message: "Product not found" });

    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // Seed Data Endpoint (Internal use or auto-run)
  // We'll run this check on startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    console.log("Seeding database...");
    await storage.createProduct({
      name: "The Royal Emerald Necklace",
      description: "A stunning masterpiece featuring a 5-carat Colombian emerald surrounded by diamonds.",
      price: 1500000, // $15,000.00
      imageUrl: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2574&auto=format&fit=crop",
      category: "Necklaces",
      isFeatured: true
    });
    await storage.createProduct({
      name: "Sapphire Drop Earrings",
      description: "Elegant drop earrings with deep blue sapphires set in 18k white gold.",
      price: 450000, // $4,500.00
      imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2683&auto=format&fit=crop",
      category: "Earrings",
      isFeatured: true
    });
    await storage.createProduct({
      name: "Vintage Gold Signet Ring",
      description: "A classic heirlooom piece. 24k solid gold with intricate engraving.",
      price: 220000, // $2,200.00
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2670&auto=format&fit=crop",
      category: "Rings",
      isFeatured: false
    });
    await storage.createProduct({
      name: "Diamond Tennis Bracelet",
      description: "Timeless elegance. 3 carats of brilliant cut diamonds.",
      price: 850000, // $8,500.00
      imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2670&auto=format&fit=crop",
      category: "Bracelets",
      isFeatured: true
    });
    console.log("Database seeded!");
  }
}
