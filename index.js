import http from "http";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

const PORT = 3000;
server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server running:
  - Local:   http://localhost:${PORT}/1
  - Network: http://${ip}:${PORT}/1`);
});
