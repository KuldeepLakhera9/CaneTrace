import React from "react";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showTagline = false, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl font-extrabold",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* CaneTrace Stalk & Node Icon */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl shadow-md text-white p-2 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Sugarcane Stalk with joint nodes */}
          <path d="M12 22V2" stroke="currentColor" strokeWidth="2.5" />
          <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="2" />
          <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="2" />

          {/* Left Sugarcane Leaf curving out */}
          <path
            d="M12 12C9 10 7 7 8 4C10 5 12 8 12 12Z"
            fill="currentColor"
            fillOpacity="0.4"
          />

          {/* Right Sugarcane Leaf curving up */}
          <path
            d="M12 7C14.5 5 16.5 3.5 18 4C17.5 6 15 8 12 9.5"
            fill="currentColor"
            fillOpacity="0.4"
          />

          {/* Digital Trace Signal Dots */}
          <circle cx="12" cy="7" r="1.5" fill="#eab308" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none" />
          <circle cx="12" cy="17" r="1.5" fill="#86efac" stroke="none" />
        </svg>
      </div>

      <div>
        <div className={`font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 ${titleSizes[size]}`}>
          <span>Cane</span>
          <span className="text-emerald-600">Trace</span>
        </div>
        {showTagline && (
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Smart Sugarcane Farmer Data Platform
          </p>
        )}
      </div>
    </div>
  );
}
