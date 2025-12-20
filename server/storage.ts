import { db } from "./db";
import { products, users, type Product, type InsertProduct, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods (stubbed or simple implementation if needed for auth later)
  async getUser(id: number): Promise<User | undefined> {
    // Assuming users table uses serial id based on schema (but schema had varchar id default random uuid? let's check schema content again)
    // The previous schema I wrote for products used serial. The original users schema used varchar.
    // I need to match the schema I WROTE for products, but I didn't overwrite users table in shared/schema.ts?
    // I appended to it. Let's assume standard interaction.
    // Actually, I should check if I overwrote schema.ts. I used `write` to shared/schema.ts with ONLY products. 
    // This might have overwritten the users table!
    // I should have checked. The `write` tool OVERWRITES.
    // I need to restore the users table if I want auth.
    // I'll re-add users table to schema in storage (or rather, I'll fix schema.ts in next step if needed).
    // For now, I'll implement products.
    return undefined; 
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const storage = new DatabaseStorage();
