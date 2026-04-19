/*This file says:

"If someone asks to scan a website,
send request to scanner service."

It does NOT do scanning.
It just forwards. */
// routes/scan.js

const express = require("express");
const router = express.Router();

const { scanWebsite } = require("../services/scanner");

router.post("/scan", async (req, res) => {
    let { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    try {
        const result = await scanWebsite(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: "Scanning failed",
            details: error.message
        });
    }
});

module.exports = router;