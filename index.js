import http from "http";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAbsoluteFSPath } from "swagger-ui-dist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger UI assets path
const swaggerPath = getAbsoluteFSPath();
const swaggerJsonPath = path.join(__dirname, "swagger", "swagger.json");

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

const server = http.createServer((req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);

  // ─── Serve Swagger JSON ───────────────────────────────
  if (req.url === "/swagger.json") {
    fs.readFile(swaggerJsonPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Cannot load swagger.json");
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  // ─── Serve Swagger UI static files ─────────────────────
  if (req.url.startsWith("/docs")) {
    const file =
      req.url === "/docs" || req.url === "/docs/"
        ? "/index.html"
        : req.url.replace("/docs", "");

    const filePath = path.join(swaggerPath, file);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Swagger UI file not found");
      }

      // rewrite index.html to load /swagger.json
      if (file === "/index.html") {
        const html = data
          .toString()
          .replace(
            "https://petstore.swagger.io/v2/swagger.json",
            "/swagger.json"
          );

        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(html);
      }

      res.writeHead(200);
      return res.end(data);
    });
    return;
  }

  // ─── Existing routes continue below ─────────────────────
  if (req.url === "/" || req.url === "/hello") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Welcome to the JSON API!" }));
  }

  const match = req.url.match(/^\/(\d+)$/);
  if (req.method === "GET" && match) {
    const fileId = match[1];
    const filePath = path.join(__dirname, "data", `${fileId}.json`);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: `File ${fileId}.json not found` })
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  const saveMatch = req.url.match(/^\/save\/(\d+)$/);
  if (req.method === "POST" && saveMatch) {
    const fileId = saveMatch[1];
    const filePath = path.join(__dirname, "data", `${fileId}.json`);

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const jsonData = JSON.parse(body);
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: "Failed to save file" }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Saved successfully" }));
        });
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

const PORT = 3000;
server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server running:
  - API: http://localhost:${PORT}/hello
  - Swagger docs: http://localhost:${PORT}/docs
  - Swagger JSON: http://localhost:${PORT}/swagger.json
`);
});
