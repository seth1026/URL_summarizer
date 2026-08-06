"use client";

import { FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ResultCard({ summary, url }: { summary: string, url: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative group animation-fade-in">
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-1000"></div>
      <div className="relative bg-[#0d0d12] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
              <FileText size={24} className="text-purple-400" />
              Summary Ready
            </h2>
            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors truncate block max-w-sm mt-1">
              {url}
            </a>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
          </button>
        </div>
        
        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
