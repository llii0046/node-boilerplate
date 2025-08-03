#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logging configuration setup script
 * Usage: node scripts/setup-logging.js [mode]
 * mode: console, file, both
 */

const modes = {
  console: {
    description: "Output to console only (recommended for development)",
    env: {
      LOG_LEVEL: "debug",
      LOG_PRETTY: "true",
      LOG_OUTPUT_FILE: "false",
    },
  },
  file: {
    description: "Output to file only (recommended for production)",
    env: {
      LOG_LEVEL: "info",
      LOG_PRETTY: "false",
      LOG_OUTPUT_FILE: "true",
      LOG_FILE_PATH: "./logs/app.log",
    },
  },
  both: {
    description: "Output to both console and file",
    env: {
      LOG_LEVEL: "debug",
      LOG_PRETTY: "true",
      LOG_OUTPUT_FILE: "true",
      LOG_FILE_PATH: "./logs/app.log",
    },
  },
};

function updateEnvFile(mode) {
  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", ".env.example");

  let envContent = "";

  // If .env file exists, read existing content
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  } else if (fs.existsSync(envExamplePath)) {
    // If .env.example exists, use it as template
    envContent = fs.readFileSync(envExamplePath, "utf8");
  }

  // Update or add logging configuration
  const config = modes[mode];
  const logConfigLines = [
    "",
    "# Logging configuration",
    `LOG_LEVEL=${config.env.LOG_LEVEL}`,
    `LOG_PRETTY=${config.env.LOG_PRETTY}`,
    `LOG_OUTPUT_FILE=${config.env.LOG_OUTPUT_FILE}`,
    `LOG_FILE_PATH=${config.env.LOG_FILE_PATH}`,
  ];

  // Remove existing logging configuration lines
  const lines = envContent.split("\n");
  const filteredLines = lines.filter(
    (line) =>
      !line.startsWith("LOG_LEVEL=") &&
      !line.startsWith("LOG_PRETTY=") &&
      !line.startsWith("LOG_OUTPUT_FILE=") &&
      !line.startsWith("LOG_FILE_PATH=") &&
      !line.startsWith("# Logging configuration"),
  );

  // Add new logging configuration
  const newContent = [...filteredLines, ...logConfigLines].join("\n");

  // Write to .env file
  fs.writeFileSync(envPath, newContent);

  console.log(`✅ Updated .env file, logging mode set to: ${mode}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`🔧 Configuration:`, config.env);
}

function showHelp() {
  console.log("🚀 Logging configuration setup script");
  console.log("");
  console.log("Usage: node scripts/setup-logging.js [mode]");
  console.log("");
  console.log("Available modes:");
  Object.entries(modes).forEach(([mode, config]) => {
    console.log(`  ${mode.padEnd(10)} - ${config.description}`);
  });
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/setup-logging.js console  # Output to console only");
  console.log("  node scripts/setup-logging.js file     # Output to file only");
  console.log("  node scripts/setup-logging.js both     # Output to both console and file");
}

function main() {
  const mode = process.argv[2];

  if (!mode || !modes[mode]) {
    showHelp();
    process.exit(1);
  }

  updateEnvFile(mode);
}

main();
