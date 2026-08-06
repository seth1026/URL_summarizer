"use client";

import { useState, useEffect } from "react";
import UrlInput from "../components/UrlInput";
import ProgressBar from "../components/ProgressBar";
import ResultCard from "../components/ResultCard";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("IDLE");
  const [summary, setSummary] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const handleSubmit = async (inputUrl: string) => {
    setStatus("STARTING");
    setJobId(null);
    setSummary(null);
    setErrorMsg(null);
    setUrl(inputUrl);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/jobs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setJobId(data.id);
      setStatus(data.status); // Usually PENDING
    } catch (err: any) {
      console.error(err);
      setStatus("FAILED");
      setErrorMsg(err.message || "Failed to submit URL");
    }
  };

  useEffect(() => {
    if (!jobId) return;
    if (status === "COMPLETED" || status === "FAILED") return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const eventSource = new EventSource(`${apiUrl}/api/jobs/${jobId}/stream`);

    eventSource.addEventListener("update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus(data.status);
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.error_message) {
          setErrorMsg(data.error_message);
        }
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    });

    eventSource.addEventListener("error", () => {
      console.error("SSE connection error");
      // Could attempt reconnect or mark failed
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [jobId, status]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-4xl text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-6 text-purple-300 backdrop-blur-sm">
          <Sparkles size={16} />
          <span>AI-Powered Insights</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Summarize Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">URL</span>
        </h1>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Paste an article, blog post, or PDF link below and let our intelligent engine extract and condense the key information for you in seconds.
        </p>

        <UrlInput onSubmit={handleSubmit} isLoading={status !== "IDLE" && status !== "COMPLETED" && status !== "FAILED"} />

        {jobId && status !== "IDLE" && status !== "COMPLETED" && status !== "FAILED" && (
          <ProgressBar status={status} />
        )}

        {status === "FAILED" && (
          <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-full max-w-2xl text-left">
            <h3 className="font-semibold text-red-300 mb-1">Processing Failed</h3>
            <p className="text-sm">{errorMsg || "An unknown error occurred."}</p>
          </div>
        )}

        {status === "COMPLETED" && summary && url && (
          <ResultCard summary={summary} url={url} />
        )}
      </div>
    </main>
  );
}
