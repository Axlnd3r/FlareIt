const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "src", "db", "schema.sql");
const targetDirectory = path.join(__dirname, "..", "dist", "db");
const target = path.join(targetDirectory, "schema.sql");

fs.mkdirSync(targetDirectory, { recursive: true });
fs.copyFileSync(source, target);
console.log(`[build] Copied schema.sql to ${target}`);
