# 🧩 Minimal Node.js JSON API

A super lightweight Node.js REST API with **no dependencies**, built using only the native `http`, `fs`, and `os` modules.
It serves multiple JSON files dynamically via routes like `/1`, `/2`, `/3`, etc.

Perfect for **local API testing**, **Flutter integration**, or **mobile device network testing**.

---

## 🚀 Features

- ⚙️ Pure Node.js — no Express or extra packages
- 🌐 Auto-detects your local IP for easy mobile access
- 🧾 Logs every API request with timestamp
- 📂 Dynamically serves multiple JSON files (`/1`, `/2`, `/3`, etc.)
- 🔁 Works offline within your Wi-Fi network

---

## 📁 Folder Structure

```
my-node-api/
├── server.js
└── data/
    ├── 1.json
    ├── 2.json
    ├── 3.json
    ├── 4.json
    └── 5.json
```

---

## 🧰 Example JSON (`data/1.json`)

```json
{
  "id": 1,
  "title": "Flutter Developer",
  "skills": ["Dart", "Flutter", "Firebase"]
}
```

You can create up to 5 files like `2.json`, `3.json`, etc.

---

## ⚙️ Server Setup (`server.js`)

This script:

- Logs every request
- Detects your local network IP
- Dynamically serves `/1` → `data/1.json`, `/2` → `data/2.json`, etc.

```js
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
  console.log(`✅ Server running:
  - Local:   http://localhost:${PORT}/1
  - Network: http://${ip}:${PORT}/1`);
});
```

---

## ▶️ Run the Server

```bash
node server.js
```

You’ll see something like:

```
✅ Server running:
  - Local:   http://localhost:3000/1
  - Network: http://192.168.1.5:3000/1
```

---

## 🌐 Accessing from Your Phone

1. Make sure your **Mac and phone are on the same Wi-Fi network**.
2. Open the **Network URL** (e.g., `http://192.168.1.5:3000/1`) in your mobile browser or Flutter app.
3. You’ll see the JSON response from the corresponding file.

---

## 🧹 Troubleshooting

- **No response on phone?**

  - Allow “Node.js” through macOS Firewall (`System Settings → Network → Firewall → Options`).
  - Ensure both devices are on the same Wi-Fi network.

- **File not found?**

  - Make sure the file exists in the `data` folder and is named correctly (e.g. `3.json` → `/3`).

---

## 🧠 Bonus Ideas

- Add `/all` route to combine all JSONs into a single response.
- Use `ngrok` to expose your local server to the internet:

  ```bash
  npm install -g ngrok
  ngrok http 3000
  ```

- Use it as a **mock API** for Flutter or React apps.

---

**Author:** Cizer Thapa
**License:** MIT
# Mocker_API
