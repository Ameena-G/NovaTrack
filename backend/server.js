require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { extractPrice, checkAllPrices } = require("./novaActService");
const { sendAlertEmail } = require("./alertService");

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

// ─── Simple JSON file "database" ────────────────────────────────────────────

function readDB() {
  if (!fs.existsSync(DB_PATH)) return { items: [], alerts: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET all tracked items
app.get("/api/items", (req, res) => {
  const db = readDB();
  res.json(db.items);
});

// POST add a new item to track
app.post("/api/items", async (req, res) => {
  const { url, targetPrice, alertEmail } = req.body;

  if (!url || !targetPrice) {
    return res.status(400).json({ error: "url and targetPrice are required" });
  }

  try {
    // Use Nova Act to immediately fetch the product info + current price
    console.log(`[Server] Adding new item, fetching initial price via Nova Act...`);
    const extracted = await extractPrice(url);

    const newItem = {
      id: uuidv4(),
      url,
      targetPrice: parseFloat(targetPrice),
      alertEmail: alertEmail || null,
      title: extracted.title,
      imageUrl: extracted.imageUrl,
      currentPrice: extracted.price,
      currency: extracted.currency,
      initialPrice: extracted.price,
      lastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      triggered: false,
      error: null,
    };

    const db = readDB();
    db.items.push(newItem);
    writeDB(db);

    res.status(201).json(newItem);
  } catch (err) {
    console.error("[Server] Error adding item:", err.message);
    res.status(500).json({ error: `Nova Act failed to fetch price: ${err.message}` });
  }
});

// DELETE remove a tracked item
app.delete("/api/items/:id", (req, res) => {
  const db = readDB();
  db.items = db.items.filter((i) => i.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// POST manually trigger a price check for one item
app.post("/api/items/:id/check", async (req, res) => {
  const db = readDB();
  const item = db.items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  try {
    const extracted = await extractPrice(item.url);
    item.currentPrice = extracted.price;
    item.lastChecked = new Date().toISOString();
    item.error = null;

    // Check if target price hit
    if (extracted.price <= item.targetPrice && !item.triggered) {
      item.triggered = true;
      const alert = {
        id: uuidv4(),
        itemId: item.id,
        title: item.title,
        url: item.url,
        targetPrice: item.targetPrice,
        triggeredPrice: extracted.price,
        currency: item.currency,
        triggeredAt: new Date().toISOString(),
      };
      db.alerts.push(alert);

      if (item.alertEmail) {
        await sendAlertEmail(item.alertEmail, alert);
      }
    }

    writeDB(db);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET alerts history
app.get("/api/alerts", (req, res) => {
  const db = readDB();
  res.json(db.alerts || []);
});

// GET app stats
app.get("/api/stats", (req, res) => {
  const db = readDB();
  const items = db.items || [];
  res.json({
    totalTracked: items.length,
    totalAlerts: (db.alerts || []).length,
    activeItems: items.filter((i) => !i.triggered).length,
    avgSavings:
      items.length > 0
        ? Math.round(
            (items.reduce((sum, i) => sum + (i.initialPrice - i.currentPrice), 0) / items.length) *
              100
          ) / 100
        : 0,
  });
});

// ─── Scheduled price checks (every hour) ────────────────────────────────────

cron.schedule("0 * * * *", async () => {
  console.log("[Cron] Running scheduled price check...");
  const db = readDB();
  if (!db.items || db.items.length === 0) return;

  const updated = await checkAllPrices(db.items);

  // Check for triggered alerts
  for (const item of updated) {
    if (item.currentPrice <= item.targetPrice && !item.triggered && !item.error) {
      item.triggered = true;
      const alert = {
        id: uuidv4(),
        itemId: item.id,
        title: item.title,
        url: item.url,
        targetPrice: item.targetPrice,
        triggeredPrice: item.currentPrice,
        currency: item.currency,
        triggeredAt: new Date().toISOString(),
      };
      db.alerts = db.alerts || [];
      db.alerts.push(alert);
      console.log(`[Cron] 🔔 Alert triggered for ${item.title}!`);

      if (item.alertEmail) {
        await sendAlertEmail(item.alertEmail, alert);
      }
    }
  }

  db.items = updated;
  writeDB(db);
  console.log(`[Cron] Done. Checked ${updated.length} item(s).`);
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Nova Act Price Tracker backend running on http://localhost:${PORT}`);
  console.log(`   Price checks scheduled every hour via node-cron\n`);
});