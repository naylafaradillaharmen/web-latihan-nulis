export function BotanicalBranch({ className = "w-10 h-10" }) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Soft watercolor splash backing */}
      <circle cx="55" cy="45" r="28" fill="#B8D2DF" fillOpacity="0.35" filter="blur(8px)" />
      <circle cx="35" cy="70" r="22" fill="#DBE7E7" fillOpacity="0.5" filter="blur(6px)" />

      {/* Main Stem */}
      <path
        d="M25 110C35 90 45 65 52 35C54 25 55 18 56 12"
        stroke="#6B8094"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Side Leaves */}
      <path
        d="M33 92C24 88 18 78 22 70C26 62 36 72 38 82"
        fill="#B8D2DF"
        fillOpacity="0.6"
        stroke="#6B8094"
        strokeWidth="1.5"
      />
      <path
        d="M44 72C54 68 62 58 58 50C54 42 46 54 45 62"
        fill="#DBE7E7"
        fillOpacity="0.7"
        stroke="#6B8094"
        strokeWidth="1.5"
      />
      <path
        d="M48 52C40 45 35 34 40 28C45 22 52 32 51 42"
        fill="#A8ACC1"
        fillOpacity="0.5"
        stroke="#6B8094"
        strokeWidth="1.5"
      />

      {/* Top Bloom Petals */}
      <g transform="translate(56, 15)">
        <ellipse cx="0" cy="-6" rx="5" ry="9" fill="#B8D2DF" fillOpacity="0.8" stroke="#6B8094" strokeWidth="1.2" />
        <ellipse cx="6" cy="-2" rx="5" ry="8" fill="#A8ACC1" fillOpacity="0.75" stroke="#6B8094" strokeWidth="1.2" />
        <ellipse cx="-6" cy="-2" rx="5" ry="8" fill="#DBE7E7" fillOpacity="0.8" stroke="#6B8094" strokeWidth="1.2" />
        <ellipse cx="4" cy="5" rx="5" ry="8" fill="#B8D2DF" fillOpacity="0.7" stroke="#6B8094" strokeWidth="1.2" />
        <ellipse cx="-4" cy="5" rx="5" ry="8" fill="#A8ACC1" fillOpacity="0.7" stroke="#6B8094" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="2.5" fill="#4D6072" />
      </g>
    </svg>
  );
}

export function LittleFlower({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 90 C30 75 38 55 42 30"
        stroke="#7A8E9F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M32 65 C22 60 18 50 24 45 C30 40 36 50 36 58"
        fill="#B8D2DF"
        fillOpacity="0.5"
        stroke="#7A8E9F"
        strokeWidth="1.2"
      />
      <path
        d="M38 48 C48 42 54 34 50 28 C46 22 40 32 40 40"
        fill="#DBE7E7"
        fillOpacity="0.6"
        stroke="#7A8E9F"
        strokeWidth="1.2"
      />
      {/* Flower Top */}
      <circle cx="43" cy="22" r="5" fill="#B8D2DF" stroke="#6B8094" strokeWidth="1.2" />
      <circle cx="37" cy="17" r="5" fill="#A8ACC1" stroke="#6B8094" strokeWidth="1.2" />
      <circle cx="49" cy="18" r="5" fill="#DBE7E7" stroke="#6B8094" strokeWidth="1.2" />
      <circle cx="43" cy="20" r="2" fill="#4D6072" />
    </svg>
  );
}

export function OpenBookLogo({ className = "w-9 h-9" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-palette-sky/30 rounded-xl blur-sm" />
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <rect x="4" y="6" width="40" height="36" rx="8" fill="#DBE7E7" fillOpacity="0.6" />
        {/* Left page */}
        <path
          d="M24 14C20 12 14 12 10 14V34C14 32 20 32 24 34V14Z"
          fill="#FFFFFF"
          stroke="#4D6072"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Right page */}
        <path
          d="M24 14C28 12 34 12 38 14V34C34 32 28 32 24 34V14Z"
          fill="#F7FAFA"
          stroke="#4D6072"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Page text lines */}
        <line x1="13" y1="18" x2="20" y2="18" stroke="#AEB8C1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="23" x2="19" y2="23" stroke="#AEB8C1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="18" x2="35" y2="18" stroke="#AEB8C1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="23" x2="34" y2="23" stroke="#AEB8C1" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
