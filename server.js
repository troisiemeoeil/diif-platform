const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || process.env.WEBSITES_PORT || 3000;

// In production, use the built server. In dev, use Next.js dev server
const app = next({ 
  dev,
  dir: dev ? __dirname : path.join(__dirname, ".next/standalone")
});
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