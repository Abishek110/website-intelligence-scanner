const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// =========================
// ANALYZE ROUTE
// =========================
app.post("/analyze", async (req, res) => {

  let website = req.body.website?.trim();

  if (!website) {
    return res.send("<h3>Please enter a website.</h3>");
  }

  if (!website.startsWith("http")) {
    website = "https://" + website;
  }

  let seoScore = 0;
  let seoNotes = [];
  let securityScore = 0;
  let securityNotes = [];

  try {
    const response = await axios.get(website, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
    "Accept": "text/html"
  },
  timeout: 10000
});

    const html = response.data;
    const headers = response.headers;

    // =========================
    // 🔎 SEO CHECKS
    // =========================

    if (html.toLowerCase().includes("<title>")) {
      seoScore += 20;
      seoNotes.push("Title tag present");
    } else {
      seoNotes.push("Missing title tag");
    }

    if (html.toLowerCase().includes('name="description"')) {
      seoScore += 20;
      seoNotes.push("Meta description present");
    } else {
      seoNotes.push("Missing meta description");
    }

    if (html.toLowerCase().includes("viewport")) {
      seoScore += 15;
      seoNotes.push("Mobile viewport configured");
    } else {
      seoNotes.push("Missing mobile viewport");
    }

    if (website.startsWith("https://")) {
      seoScore += 10;
      seoNotes.push("Using HTTPS");
    }

    const textOnly = html.replace(/<[^>]*>/g, " ");
    const wordCount = textOnly.split(/\s+/).length;

    if (wordCount > 300) {
      seoScore += 15;
      seoNotes.push("Good content length");
    } else {
      seoNotes.push("Low content length");
    }

    if (html.toLowerCase().includes("<h1")) {
      seoScore += 10;
      seoNotes.push("H1 tag present");
    } else {
      seoNotes.push("Missing H1 tag");
    }

    const imgTags = html.match(/<img [^>]*>/g) || [];
    let altCount = 0;

    imgTags.forEach(img => {
      if (img.toLowerCase().includes("alt=")) {
        altCount++;
      }
    });

    if (imgTags.length > 0 && altCount / imgTags.length > 0.5) {
      seoScore += 10;
      seoNotes.push("Most images have ALT attributes");
    } else if (imgTags.length > 0) {
      seoNotes.push("Images missing ALT attributes");
    }

    // =========================
    // 🔐 SECURITY CHECKS
    // =========================

    if (website.startsWith("https://")) {
      securityScore += 40;
      securityNotes.push("HTTPS Enabled");
    } else {
      securityNotes.push("Not using HTTPS");
    }

    if (response.status === 200) {
      securityScore += 20;
      securityNotes.push("Website Reachable");
    }

    if (headers["x-frame-options"]) {
      securityScore += 10;
      securityNotes.push("X-Frame-Options present");
    }

    if (headers["content-security-policy"]) {
      securityScore += 15;
      securityNotes.push("Content-Security-Policy present");
    }

    if (headers["strict-transport-security"]) {
      securityScore += 15;
      securityNotes.push("HSTS enabled");
    }

    // =========================
    // FINAL OUTPUT
    // =========================

    return res.json({
  website,
  seoScore,
  seoNotes,
  securityScore,
  securityNotes
});


  } catch (error) {
    console.log(error.message);

    return res.json({
  error: "This website may block automated requests."
});

  }
});

// =========================
// SERVER START
// =========================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
