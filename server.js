const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const port = process.env.PORT || process.env.WEBSITES_PORT || 3000;

// Ensure node_modules exists, if not install dependencies
const nodeModulesPath = path.join(__dirname, "node_modules");
if (!fs.existsSync(nodeModulesPath)) {
  console.log("node_modules not found, installing dependencies...");
  try {
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
  } catch (e) {
    console.error("Failed to install dependencies:", e.message);
  }
}

const dev = process.env.NODE_ENV !== "production";
const next = require("next");
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});