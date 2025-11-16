# 📁 JSON File API (Node.js + Swagger UI)

A lightweight Node.js server built using the native `http` module.
It provides a JSON-based API for reading and writing `.json` files and includes fully integrated **Swagger API documentation**.

---

## 🚀 Features

- 📡 **GET /:id** — Read a JSON file by ID
- 📝 **POST /save/:id** — Save JSON data to a file
- 🏠 **GET /hello** — Basic welcome endpoint
- 📄 **Automatic Swagger UI documentation** at `/docs`
- 💾 Saves JSON files into `/data` directory
- ⚡ No Express or frameworks — pure Node.js
- 🌐 Works on both local and network IP addresses

---

## 📦 Project Structure

```
project/
├── data/                 # Saved JSON files
├── swagger/
│   └── swagger.json      # OpenAPI documentation
├── package.json
├── server.js             # Main server
└── README.md
```

---

## 🛠️ Installation

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

---

## ▶️ Run the Server

```bash
node server.js
```

You will see output similar to:

```
Server running:
  - API: http://localhost:3000/hello
  - Swagger docs: http://localhost:3000/docs
  - Swagger JSON: http://localhost:3000/swagger.json
```

---

## 📚 API Documentation (Swagger UI)

Swagger UI is automatically hosted at:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

The raw OpenAPI file is available at:

👉 **[http://localhost:3000/swagger.json](http://localhost:3000/swagger.json)**

---

## 🔌 API Endpoints

### **1. GET /hello**

Returns a basic welcome message.

**Response:**

```json
{ "message": "Welcome to the JSON API!" }
```

---

### **2. GET /:id**

Reads a JSON file from the `data` folder.

Example:
`GET /1` → reads `data/1.json`

**Response Example:**

```json
{
  "name": "John",
  "age": 25
}
```

---

### **3. POST /save/:id**

Stores JSON sent in request body into a file.

Example:
`POST /save/5` → saves into `data/5.json`

**Example Request:**

```bash
curl -X POST http://localhost:3000/save/5 \
  -H "Content-Type: application/json" \
  -d '{ "title": "My Data", "value": 123 }'
```

**Response:**

```json
{ "message": "Saved successfully" }
```

---

## 🗃️ Data Storage

All saved files go into:

```
/data
  ├── 1.json
  ├── 2.json
  ├── 5.json
  └── ...
```

Files are automatically created if they don’t exist.

---

## 🧩 Swagger Documentation

Swagger UI is served using:

- `swagger-ui-dist` (static frontend)
- Custom endpoint serving `/swagger.json`

The Swagger file lives at:

```
swagger/swagger.json
```

You can edit this file to define or update API routes.

---

## 🤝 Contribution

Feel free to open pull requests or issues.
Suggestions are welcome!

---

## 📄 License

MIT License — free to use, modify, and distribute.
