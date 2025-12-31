import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { registerRoutes } from "./routes";
import { ensureDbTables, pool } from "./db";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure CORS to allow requests from the frontend (set FRONTEND_ORIGIN in production)
// Normalize the origin to avoid mismatches like a trailing slash
const rawFrontendOrigin =
  process.env.FRONTEND_ORIGIN ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:5173" : undefined);
const frontendOrigin = rawFrontendOrigin
  ? String(rawFrontendOrigin).replace(/\/$/, "")
  : undefined;
if (frontendOrigin) {
  app.use(
    cors({
      origin: frontendOrigin,
      credentials: true,
    })
  );
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure DB schema for users/sessions exists before routes/auth run
  try {
    await ensureDbTables();
  } catch (err) {
    console.error("Failed to ensure DB tables:", err);
    process.exit(1);
  }

  // Auto-create admin user from environment variables if provided
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      // import here to avoid circular before db initialized
      const auth = await import("./auth_db");
      const existing = await auth.findUserByEmail(adminEmail);
      if (!existing) {
        console.log(`Creating admin user: ${adminEmail}`);
        const user = await auth.createUser(
          adminEmail.split("@")[0],
          adminEmail,
          adminPassword
        );
        // ensure admin flag is set
        await pool.query("UPDATE users SET is_admin = true WHERE id = $1", [
          user.id,
        ]);
      } else {
        // ensure existing user is marked admin when ADMIN_EMAIL present
        await pool.query("UPDATE users SET is_admin = true WHERE email = $1", [
          adminEmail.toLowerCase(),
        ]);
      }
    }
  } catch (err) {
    console.error("Failed to create admin user:", err);
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging but do not re-throw, which would crash the server
    console.error(err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
