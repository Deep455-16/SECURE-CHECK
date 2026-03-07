import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ScanResult {
  resolvedIP: string;
  https: boolean;
  statusCode: number;
  riskScore: number;
  overallSeverity: string;
  headersChecked: Record<string, string>;
  informationLeakage: string[];
}

interface HistoryItem {
  url: string;
  result: ScanResult;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<ScanResult>(
        "https://securescan-20a8.onrender.com/api/scan",
        { url }
      );

      setResult(response.data);

      setHistory((prev) => {
        const updated = [{ url, result: response.data }, ...prev];
        return updated.slice(0, 5);
      });

    } catch (err: any) {
      setError(err.response?.data?.error || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `scan-${url.replace(/https?:\/\//, "")}.json`;
    link.click();
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === "High")
      return "bg-red-500/20 text-red-400 border border-red-500/40";
    if (severity === "Medium")
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
  };

  const getRiskBarColor = (severity: string) => {
    if (severity === "High") return "bg-red-500";
    if (severity === "Medium") return "bg-yellow-400";
    return "bg-emerald-400";
  };

  const MAX_RISK = 8;
  const riskPercentage =
    result ? Math.min((result.riskScore / MAX_RISK) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white relative overflow-hidden">

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-emerald-500 opacity-10 blur-[120px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center pt-16 sm:pt-24 px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 sm:gap-4 mb-4"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            🛡️
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Secure
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Scan
            </span>
          </h1>
        </motion.div>

        <p className="text-gray-400 mb-8 sm:mb-10 text-center max-w-xl text-sm sm:text-base">
          Analyze website security headers & detect vulnerabilities
        </p>

        {/* Input Section */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-[#111827] border border-gray-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all"
          />

          <button
            onClick={handleScan}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              "SCAN"
            )}
          </button>
        </div>

        {/* Scan History */}
        {history.length > 0 && (
          <div className="w-full max-w-3xl mb-10">
            <h3 className="text-gray-400 mb-3 text-sm">Recent Scans</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setResult(item.result);
                    setUrl(item.url);
                  }}
                  className="px-3 sm:px-4 py-2 bg-[#1f2937] rounded-lg hover:bg-gray-700 text-xs sm:text-sm transition"
                >
                  {item.url}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl bg-[#111827] border border-gray-700 rounded-2xl p-5 sm:p-8 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold">Scan Results</h2>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={downloadReport}
                    className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition"
                  >
                    Download JSON
                  </button>

                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold ${getSeverityStyle(
                      result.overallSeverity
                    )}`}
                  >
                    {result.overallSeverity}
                  </motion.span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 text-sm">
                <div>
                  <p><strong>Resolved IP:</strong> {result.resolvedIP}</p>
                  <p><strong>Status Code:</strong> {result.statusCode}</p>
                </div>
                <div>
                  <p><strong>HTTPS:</strong> {result.https ? "Yes" : "No"}</p>
                  <p><strong>Risk Score:</strong> {result.riskScore}</p>
                </div>
              </div>

              {/* Risk Meter */}
              <div className="mb-8">
                <div className="flex justify-between mb-2 text-xs sm:text-sm text-gray-400">
                  <span>Risk Level</span>
                  <span>{Math.round(riskPercentage)}%</span>
                </div>

                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${riskPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full ${getRiskBarColor(result.overallSeverity)}`}
                  />
                </div>
              </div>

              {/* Security Headers */}
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Security Headers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.headersChecked).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between bg-[#1f2937] px-4 py-3 rounded-lg text-sm"
                    >
                      <span className="truncate">{key}</span>
                      <span
                        className={
                          value === "Present"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Information Leakage */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">
                  Information Leakage
                </h3>

                {result.informationLeakage.length === 0 ? (
                  <p className="text-emerald-400 text-sm">None Detected</p>
                ) : (
                  <ul className="list-disc list-inside text-red-400 text-sm">
                    {result.informationLeakage.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}