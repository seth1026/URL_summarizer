"use client";

import { useState } from "react";
import { Link, ArrowRight, Loader2 } from "lucide-react";

export default function UrlInput({ onSubmit, isLoading }: { onSubmit: (url: string) => void, isLoading: boolean }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <form onSubmit={handleSubmit} className="relative bg-black/50 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
        <div className="pl-4 pr-2 text-white/50">
          <Link size={20} />
        </div>
        <input
          type="url"
          required
          placeholder="Paste any article or PDF URL to summarize..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-lg px-2"
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="bg-white text-black font-semibold rounded-xl px-6 py-3 hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Summarize"}
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}
