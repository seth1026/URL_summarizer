"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ProgressBar({ status }: { status: string }) {
  const steps = ["PENDING", "FETCHING", "EXTRACTING", "SUMMARIZING", "COMPLETED"];
  
  let currentIndex = steps.indexOf(status);
  if (status === "FAILED") currentIndex = steps.length; // Max out progress on failure for display

  // Calculate percentage
  const percentage = status === "FAILED" ? 100 : Math.max(5, (currentIndex / (steps.length - 1)) * 100);

  const getStatusText = () => {
    switch(status) {
      case "PENDING": return "In Queue...";
      case "FETCHING": return "Downloading content...";
      case "EXTRACTING": return "Parsing text...";
      case "SUMMARIZING": return "AI is summarizing...";
      case "COMPLETED": return "Done!";
      case "FAILED": return "Failed.";
      default: return status;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-4 text-sm font-medium text-white/80">
        <div className="flex items-center gap-2">
          {status === "COMPLETED" ? <CheckCircle className="text-green-400" size={18} /> : 
           status === "FAILED" ? <XCircle className="text-red-400" size={18} /> : 
           <Loader2 className="animate-spin text-purple-400" size={18} />}
          <span>{getStatusText()}</span>
        </div>
        <div>
          {status === "FAILED" ? "Error" : `${Math.round(percentage)}%`}
        </div>
      </div>
      
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${status === 'FAILED' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
