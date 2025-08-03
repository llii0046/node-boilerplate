import "reflect-metadata";
import { app } from "./app.js";
import { banner, checkDatabase, maskDatabaseUrl } from "./utils/startup.js";
import { AppModule } from "./app.module.js";

const port = Number(process.env.PORT) || 3000;
const env = process.env.NODE_ENV || "development";
const nodeVersion = process.version;

async function startServer() {
  try {
    // Create AppModule
    const appModule = new AppModule();

    // Initialize module
    await appModule.onModuleInit();
    console.log("🔧 AppModule initialized");

    app.use("/api", appModule.getRouter());

    // 404 handler - must be after all route registrations
    app.use((_req, res) => {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Requested resource not found",
        path: _req.path,
      });
    });

    // Check database connection
    const dbCheck = await checkDatabase();
    const dbUrlMasked = maskDatabaseUrl(process.env.DATABASE_URL);

    // Start server
    const server = app.listen(port, () => {
      // Use banner function to output startup information
      const startupBanner = banner({
        port,
        env,
        dbUrlMasked,
        nodeVersion,
      });

      console.log(startupBanner);

      if (!dbCheck.ok) {
        console.warn(`⚠️ Database connection warning: ${dbCheck.message}`);
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await appModule.onModuleDestroy();
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(async () => {
        await appModule.onModuleDestroy();
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
