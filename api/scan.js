import { scanWebsite } from '../scanner.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    try {
        const result = await scanWebsite(url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            error: "Scanning failed",
            details: error.message
        });
    }
}
