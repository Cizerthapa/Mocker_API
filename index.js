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

  if (req.url === "/swagger.json") {
    console.log(`[DEBUG] Serving swagger.json from: ${swaggerJsonPath}`);
    fs.readFile(swaggerJsonPath, (err, data) => {
      if (err) {
        console.error(`[ERROR] Cannot load swagger.json: ${err.message}`);
        res.writeHead(500);
        return res.end("Cannot load swagger.json");
      }
      console.log(
        `[DEBUG] Successfully loaded swagger.json, size: ${data.length} bytes`
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  // ─── Serve Swagger UI ───────────────────────────────
  if (req.url.startsWith("/docs")) {
    const file =
      req.url === "/docs" || req.url === "/docs/"
        ? "/index.html"
        : req.url.replace("/docs", "");

    const filePath = path.join(swaggerPath, file);
    console.log(
      `[DEBUG] Swagger UI request - file: "${file}", resolved path: ${filePath}`
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(
          `[ERROR] Swagger UI file not found: ${filePath}, error: ${err.message}`
        );
        res.writeHead(404);
        return res.end("Swagger UI file not found");
      }

      // Modify index.html to fix asset paths
      if (file === "/index.html") {
        let html = data.toString();
        console.log(
          `[DEBUG] Processing Swagger UI index.html, original length: ${html.length} chars`
        );

        // Fix asset paths so they load correctly under /docs
        console.log(`[DEBUG] Fixing asset paths for /docs prefix`);
        let replacementCount = 0;

        html = html.replace(/href="([^"]*)"/g, (match, url) => {
          if (
            url.startsWith("http") ||
            url.startsWith("#") ||
            url.startsWith("/docs")
          ) {
            return match;
          }
          replacementCount++;
          return `href="/docs${url.startsWith("/") ? url : "/" + url}"`;
        });

        html = html.replace(/src="([^"]*)"/g, (match, url) => {
          if (
            url.startsWith("http") ||
            url.startsWith("#") ||
            url.startsWith("/docs")
          ) {
            return match;
          }
          replacementCount++;
          return `src="/docs${url.startsWith("/") ? url : "/" + url}"`;
        });

        console.log(`[DEBUG] Made ${replacementCount} asset path replacements`);
        console.log(`[DEBUG] Final HTML length: ${html.length} chars`);

        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(html);
      }

      // Modify swagger-initializer.js to use our local swagger.json
      if (file === "/swagger-initializer.js") {
        let js = data.toString();
        console.log(
          `[DEBUG] Processing swagger-initializer.js, original length: ${js.length} chars`
        );

        // Replace the URL in the SwaggerUIBundle configuration
        const originalUrl = "https://petstore.swagger.io/v2/swagger.json";
        if (js.includes(originalUrl)) {
          console.log(
            `[DEBUG] Found Petstore URL in swagger-initializer.js, replacing with local swagger.json`
          );
          js = js.replace(originalUrl, "/swagger.json");
        } else {
          // Try to find any URL pattern in the SwaggerUIBundle config
          const urlRegex = /url:\s*["']([^"']+)["']/;
          const match = js.match(urlRegex);
          if (match) {
            console.log(
              `[DEBUG] Found URL in swagger-initializer.js: ${match[1]}, replacing with local swagger.json`
            );
            js = js.replace(urlRegex, 'url: "/swagger.json"');
          } else {
            // If no URL found, inject our configuration
            console.log(
              `[DEBUG] No URL found, injecting custom SwaggerUIBundle configuration`
            );
            js = js.replace(
              /window\.onload\s*=\s*function\(\)\s*{([^}]*)}/,
              `window.onload = function() {
                // Begin injected configuration
                window.ui = SwaggerUIBundle({
                  url: "/swagger.json",
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                  ],
                  plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                  ],
                  layout: "StandaloneLayout"
                });
                // End injected configuration
              }`
            );
          }
        }

        console.log(
          `[DEBUG] Final swagger-initializer.js length: ${js.length} chars`
        );
        res.writeHead(200, { "Content-Type": "application/javascript" });
        return res.end(js);
      }

      console.log(`[DEBUG] Serving Swagger UI static file: ${filePath}`);

      // Set appropriate content types
      if (file.endsWith(".css")) {
        res.writeHead(200, { "Content-Type": "text/css" });
      } else if (file.endsWith(".js")) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
      } else if (file.endsWith(".png")) {
        res.writeHead(200, { "Content-Type": "image/png" });
      } else {
        res.writeHead(200);
      }

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

  // Verify swagger.json exists on startup
  fs.access(swaggerJsonPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        `[STARTUP ERROR] swagger.json not found at: ${swaggerJsonPath}`
      );
    } else {
      console.log(`[STARTUP] swagger.json found at: ${swaggerJsonPath}`);

      // Log the contents of swagger.json for verification
      fs.readFile(swaggerJsonPath, "utf8", (err, data) => {
        if (!err) {
          console.log(
            `[STARTUP] swagger.json contents preview:`,
            data.substring(0, 200) + "..."
          );
        }
      });
    }
  });
});
