/*This is the real scanner.

This file:

Visits the website

Reads response

Checks security headers

Returns report*/

// services/scanner.js

const axios = require("axios");
const dns = require("dns").promises;

function isPrivateIP(ip) {
    return (
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("172.16.") ||
        ip.startsWith("172.17.") ||
        ip.startsWith("172.18.") ||
        ip.startsWith("172.19.") ||
        ip.startsWith("172.20.") ||
        ip.startsWith("172.21.") ||
        ip.startsWith("172.22.") ||
        ip.startsWith("172.23.") ||
        ip.startsWith("172.24.") ||
        ip.startsWith("172.25.") ||
        ip.startsWith("172.26.") ||
        ip.startsWith("172.27.") ||
        ip.startsWith("172.28.") ||
        ip.startsWith("172.29.") ||
        ip.startsWith("172.30.") ||
        ip.startsWith("172.31.") ||
        ip.startsWith("127.") ||
        ip === "169.254.169.254"
    );
}

async function scanWebsite(url) {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (hostname === "localhost") {
        throw new Error("Scanning localhost is not allowed");
    }

    const { address } = await dns.lookup(hostname);

    if (isPrivateIP(address)) {
        throw new Error("Scanning private or internal IPs is not allowed");
    }

    const response = await axios.get(url, { timeout: 5000 });

    const report = {
        url,
        resolvedIP: address,
        https: parsedURL.protocol === "https:",
        statusCode: response.status,
        headersChecked: {},
        informationLeakage: [],
        riskScore: 0,
        overallSeverity: "Low"
    };

    const securityHeaders = [
        "content-security-policy",
        "x-frame-options",
        "x-content-type-options",
        "strict-transport-security"
    ];

    securityHeaders.forEach(header => {
        report.headersChecked[header] =
            response.headers[header] ? "Present" : "Missing";
    });

     if (response.headers["server"]) {
        report.informationLeakage.push(
            `Server header exposed: ${response.headers["server"]}`
        );
    }

    if (response.headers["x-powered-by"]) {
        report.informationLeakage.push(
            `X-Powered-By exposed: ${response.headers["x-powered-by"]}`
        );
    }

    // HTTPS missing = High risk
    if (!report.https) {
        report.riskScore += 3;
    }

    // Missing important headers
    Object.values(report.headersChecked).forEach(status => {
        if (status === "Missing") {
            report.riskScore += 1;
        }
    });

    // Information leakage
    if (report.informationLeakage.length > 0) {
        report.riskScore += 1;
    }

    // Determine severity level
    if (report.riskScore >= 5) {
        report.overallSeverity = "High";
    } else if (report.riskScore >= 3) {
        report.overallSeverity = "Medium";
    } else {
        report.overallSeverity = "Low";
    }

    return report;
}

module.exports = { scanWebsite };