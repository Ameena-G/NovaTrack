/**
 * novaActService.js
 * Playwright + Groq AI price extraction
 * Uses stealth settings to avoid bot detection
 */

const { chromium } = require("playwright");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractPrice(url) {
  const browser = await chromium.launch({
    headless: false, // visible browser — avoids most bot detection
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    timezoneId: "America/New_York",
    // Disable webdriver flag that sites detect
    javaScriptEnabled: true,
  });

  // Hide automation signals
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
  });

  const page = await context.newPage();

  try {
    console.log(`[Browser] Navigating to ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });
    await page.waitForTimeout(3000); // let page settle

    const pageTitle = await page.title();
    console.log(`[Browser] Page title: ${pageTitle}`);

    const bodyText = await page.evaluate(() => {
      const remove = document.querySelectorAll(
        "script, style, nav, footer, iframe"
      );
      remove.forEach((el) => el.remove());
      return document.body.innerText.slice(0, 5000);
    });

    console.log("[DEBUG] First 300 chars:", bodyText.slice(0, 300));

    const imageUrl = await page
      .evaluate(() => {
        const img =
          document.querySelector("#landingImage") ||
          document.querySelector(".primary-image img") ||
          document.querySelector('[data-testid="hero-image"] img') ||
          document.querySelector("img.product-image") ||
          document.querySelector("main img");
        return img ? img.src : "";
      })
      .catch(() => "");

    await browser.close();

    console.log(`[Groq] Extracting price from page content...`);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content:
            "You are a price extraction tool. Always respond with ONLY a valid JSON object, no explanation, no markdown.",
        },
        {
          role: "user",
          content: `Extract the CURRENT selling price from this product page text.

Page title: ${pageTitle}
URL: ${url}

Page text:
${bodyText}

Respond with ONLY this JSON (no markdown, no explanation):
{"price": <number>, "currency": "USD", "title": "<product name max 80 chars>"}

If no price found: {"error": "price not found"}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    console.log("[Groq] Raw response:", raw);
    const clean = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Groq did not return valid JSON");

    const data = JSON.parse(jsonMatch[0]);
    if (data.error) throw new Error(data.error);
    if (typeof data.price !== "number" || isNaN(data.price)) {
      throw new Error("Could not parse a valid price");
    }

    return {
      price: data.price,
      currency: data.currency || "USD",
      title: data.title || pageTitle.slice(0, 80),
      imageUrl: imageUrl || "",
    };
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

async function checkAllPrices(trackedItems) {
  const results = [];
  for (const item of trackedItems) {
    try {
      console.log(`[Service] Checking: ${item.url}`);
      const extracted = await extractPrice(item.url);
      results.push({
        ...item,
        currentPrice: extracted.price,
        currency: extracted.currency,
        title: item.title || extracted.title,
        imageUrl: item.imageUrl || extracted.imageUrl,
        lastChecked: new Date().toISOString(),
        error: null,
      });
      console.log(`[Service] ✓ ${extracted.title}: ${extracted.currency} ${extracted.price}`);
    } catch (err) {
      console.error(`[Service] ✗ ${item.url}:`, err.message);
      results.push({
        ...item,
        lastChecked: new Date().toISOString(),
        error: err.message,
      });
    }
  }
  return results;
}

module.exports = { extractPrice, checkAllPrices };