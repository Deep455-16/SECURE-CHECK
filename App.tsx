import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheck, Download, Search, Settings2, Clock, Trash2, ShieldBan, Info } from 'lucide-react'
import axios from 'axios'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

// Helper for tailwind class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

type ScanResult = {
  url: string
  resolvedIP: string
  https: boolean
  statusCode: number
  headersChecked: Record<string, string>
  informationLeakage: string[]
  riskScore: number
  overallSeverity: string
  timestamp?: number
}

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorText, setErrorText] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [history, setHistory] = useState<ScanResult[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('secureCheckHistory')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse history")
      }
    }
  }, [])

  const saveHistory = (newHistory: ScanResult[]) => {
    setHistory(newHistory)
    localStorage.setItem('secureCheckHistory', JSON.stringify(newHistory))
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setStatus("loading")
    setErrorText("")
    setResult(null)

    try {
      const response = await axios.post("/api/scan", { url })
      const data: ScanResult = response.data
      data.timestamp = Date.now()
      setResult(data)
      saveHistory([data, ...history.filter(h => h.url !== data.url)])
      setStatus("success")
    } catch (error: any) {
      console.error(error)
      setErrorText(error?.response?.data?.error || error?.message || "An unknown error occurred")
      setStatus("error")
    }
  }

  const clearHistory = () => {
    saveHistory([])
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const urlBlob = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlBlob
    a.download = `secure-check-report-${new URL(result.url).hostname}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(urlBlob)
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'High') return 'text-danger'
    if (severity === 'Medium') return 'text-warning'
    return 'text-primary'
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 px-4 sm:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl flex items-center gap-3 mb-12 justify-center"
      >
        <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            SECURE-CHECK
          </h1>
          <p className="text-textMuted text-sm">Enterprise Web Vulnerability Scanner</p>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Panel */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <motion.form 
            onSubmit={handleScan}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-600" />
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Analyze Website
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter URL to scan (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textMain"
                disabled={status === "loading"}
              />
              <button 
                type="submit" 
                disabled={status === "loading" || !url}
                className="bg-primary hover:bg-primaryHover text-black font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {status === "loading" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Settings2 className="w-5 h-5" />
                  </motion.div>
                ) : "Scan Now"}
              </button>
            </div>
            
            <AnimatePresence>
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {errorText}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <AnimatePresence mode="wait">
            {result && status === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col gap-6"
              >
                {/* Result Header */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-primary">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 truncate max-w-md">{result.url}</h3>
                    <p className="text-textMuted text-sm flex gap-4">
                      <span>IP: <span className="text-textMain">{result.resolvedIP}</span></span>
                      <span>Status Code: <span className={result.statusCode === 200 ? "text-primary" : "text-warning"}>{result.statusCode}</span></span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-textMuted uppercase tracking-wider font-semibold">Severity</p>
                      <p className={cn("text-2xl font-bold uppercase", getSeverityColor(result.overallSeverity))}>
                        {result.overallSeverity}
                      </p>
                    </div>
                    <button 
                      onClick={handleDownload}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                      title="Download Report"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Headers */}
                  <div className="glass-panel rounded-2xl p-6">
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                      <ShieldBan className="w-5 h-5 text-primary" />
                      Security Headers
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {Object.entries(result.headersChecked).map(([header, present]) => (
                        <li key={header} className="flex justify-between items-center text-sm">
                          <span className="font-mono text-textMuted">{header}</span>
                          {present === "Present" ? (
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-danger/20 text-danger rounded-md text-xs font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Missing
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Leakage & Risk */}
                  <div className="flex flex-col gap-6">
                    <div className="glass-panel rounded-2xl p-6 flex-1">
                      <h4 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                        <Info className="w-5 h-5 text-warning" />
                        Information Leakage
                      </h4>
                      {result.informationLeakage.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                          {result.informationLeakage.map((leak, idx) => (
                            <li key={idx} className="text-sm bg-warning/10 border border-warning/20 text-warning px-3 py-2 rounded-lg">
                              {leak}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-textMuted">No visible information leakage detected in the headers.</p>
                      )}
                    </div>

                    <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
                      <span className="text-lg font-semibold text-textMuted">Total Risk Score</span>
                      <span className="text-3xl font-bold bg-white/10 px-4 py-1 rounded-xl">
                        {result.riskScore}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar History */}
        <div className="w-full lg:w-80 glass-panel rounded-2xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-textMuted" />
              Recent Scans
            </h3>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-textMuted hover:text-danger transition-colors p-1"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 max-h-[600px]">
            {history.length === 0 ? (
              <p className="text-sm text-textMuted text-center mt-6">No scan history yet.</p>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/30 border border-white/5 rounded-xl p-3 cursor-pointer hover:bg-black/50 transition-colors"
                  onClick={() => {
                    setResult(item)
                    setStatus("success")
                    setUrl(item.url)
                  }}
                >
                  <p className="text-sm font-semibold truncate" title={item.url}>{item.url}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-textMuted">
                      {new Date(item.timestamp || Date.now()).toLocaleDateString()}
                    </span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase", 
                      item.overallSeverity === 'High' ? 'bg-danger/20 text-danger' :
                      item.overallSeverity === 'Medium' ? 'bg-warning/20 text-warning' :
                      'bg-primary/20 text-primary'
                    )}>
                      {item.overallSeverity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App