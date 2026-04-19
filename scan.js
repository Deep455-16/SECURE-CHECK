/*This file says:

"If someone asks to scan a website,
send request to scanner service."

It does NOT do scanning.
It just forwards. */
// routes/scan.js

import express from "express";
const router = express.Router();

import { scanWebsite } from "./scanner.js";

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

export default router;