/*This file:

Starts server

Connects routes

Listens on port 5000

Port = door number.

If port is 5000,
your backend is available at:

http://localhost:5000*/
import rateLimit from "express-rate-limit";
import scanRoutes from "./scan.js";
import express from 'express';
// we are importing express module to create a server
import cors from 'cors'; // importing cors package 
const app = express();
// we are creating our server
app.use(cors({ origin: "*" }));// .use() means apply this setting to every request
app.use(express.json());
// Rate limiter configuration
const scanLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per minute
    message: {
        error: "Too many scan requests. Please try again later."
    }
});
const axios = require("axios");
// this means if someone sends json data convert it into JavaScript object
app.get("/", (req, res) => {
    res.send("SecureScan backend is running");
});
// this creates a route 
app.use("/api",scanLimiter,scanRoutes);
// start listening for requests only if not in a Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;