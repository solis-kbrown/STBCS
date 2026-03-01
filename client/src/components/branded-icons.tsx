interface IconProps {
  className?: string;
}

export function SSHIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ssh-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="ssh-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <filter id="ssh-pulse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="8" y="8" width="48" height="36" rx="4" fill="url(#ssh-screen)" stroke="#3f3f46" strokeWidth="1.5" />
      <rect x="8" y="8" width="48" height="36" rx="4" fill="none" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="24" y1="48" x2="40" y2="48" stroke="#52525b" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="52" x2="44" y2="52" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
      <text x="14" y="22" fill="#f97316" fontSize="7" fontFamily="monospace" opacity="0.9">$_</text>
      <text x="14" y="31" fill="#06b6d4" fontSize="6" fontFamily="monospace" opacity="0.6">ssh root@</text>
      <text x="14" y="38" fill="#22c55e" fontSize="5" fontFamily="monospace" opacity="0.5">connected</text>
      <g filter="url(#ssh-pulse)">
        <circle cx="48" cy="14" r="7" fill="#09090b" stroke="#f97316" strokeWidth="1.2" />
        <rect x="46" y="11" width="4" height="4" rx="0.5" fill="#f97316" opacity="0.9" />
        <rect x="46.5" y="15" width="3" height="2" rx="1" fill="#f97316" opacity="0.7" />
        <circle cx="48" cy="14" r="9" fill="none" stroke="#f97316" strokeWidth="0.4" strokeOpacity="0.3">
          <animate attributeName="r" values="7;11;7" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
      <line x1="12" y1="44" x2="22" y2="44" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="42" y1="44" x2="52" y2="44" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="12" y1="6" x2="12" y2="8" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.2" />
      <line x1="52" y1="6" x2="52" y2="8" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.2" />
    </svg>
  );
}

export function RDPIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="rdp-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="rdp-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
        <clipPath id="rdp-clip">
          <rect x="10" y="8" width="44" height="32" rx="2" />
        </clipPath>
      </defs>
      <rect x="6" y="6" width="52" height="38" rx="4" fill="url(#rdp-screen)" stroke="#3f3f46" strokeWidth="1.5" />
      <rect x="6" y="6" width="52" height="38" rx="4" fill="none" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.3" />
      <line x1="28" y1="44" x2="36" y2="44" stroke="#52525b" strokeWidth="2" />
      <rect x="18" y="48" width="28" height="3" rx="1.5" fill="#27272a" stroke="#3f3f46" strokeWidth="0.5" />
      <g clipPath="url(#rdp-clip)">
        <rect x="10" y="10" width="20" height="14" rx="1" fill="#27272a" stroke="#3f3f46" strokeWidth="0.5" />
        <rect x="32" y="10" width="20" height="14" rx="1" fill="#1a1a2e" stroke="#3f3f46" strokeWidth="0.5" />
        <rect x="10" y="26" width="42" height="3" rx="1" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
        <rect x="12" y="12" width="6" height="4" rx="0.5" fill="#f97316" opacity="0.3" />
        <rect x="20" y="12" width="8" height="1" rx="0.5" fill="#52525b" />
        <rect x="20" y="15" width="6" height="1" rx="0.5" fill="#3f3f46" />
        <rect x="34" y="12" width="16" height="10" rx="1" fill="#1e1b4b" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.4" />
        <rect x="10" y="10" width="42" height="22" fill="none">
          <animate attributeName="opacity" values="1;0.97;1" dur="0.1s" repeatCount="indefinite" />
        </rect>
        <line x1="10" y1="18" x2="52" y2="18" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.15">
          <animate attributeName="y1" values="8;40;8" dur="4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="8;40;8" dur="4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0.05;0.2" dur="4s" repeatCount="indefinite" />
        </line>
      </g>
      <g>
        <path d="M46 16 L52 10 L58 16" fill="none" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7">
          <animate attributeName="stroke-opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M49 13 L55 7" fill="none" stroke="#f97316" strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="2 2">
          <animate attributeName="stroke-dashoffset" values="0;4" dur="1s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}

export function TelnetIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="tnet-globe" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#09090b" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="30" r="22" fill="url(#tnet-globe)" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.5" />
      <ellipse cx="32" cy="30" rx="10" ry="22" fill="none" stroke="#f59e0b" strokeWidth="0.6" strokeOpacity="0.25" />
      <ellipse cx="32" cy="30" rx="16" ry="22" fill="none" stroke="#f59e0b" strokeWidth="0.4" strokeOpacity="0.15" />
      <line x1="10" y1="22" x2="54" y2="22" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.2" />
      <line x1="10" y1="30" x2="54" y2="30" stroke="#f59e0b" strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="10" y1="38" x2="54" y2="38" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="32" cy="30" r="24" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0">
        <animate attributeName="r" values="22;28;22" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="30" r="22" fill="none" stroke="#f59e0b" strokeWidth="0.3" strokeOpacity="0">
        <animate attributeName="r" values="22;30;22" dur="3s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="22" cy="22" r="1.5" fill="#f59e0b" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="35" r="1.5" fill="#f59e0b" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.5s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="28" cy="40" r="1" fill="#f59e0b" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" begin="0.8s" />
      </circle>
      <circle cx="38" cy="18" r="1.2" fill="#f59e0b" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <g opacity="0.7">
        <rect x="18" y="48" width="28" height="10" rx="2" fill="#18181b" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4" />
        <text x="22" y="55" fill="#f59e0b" fontSize="5" fontFamily="monospace" opacity="0.8">telnet&gt;</text>
        <rect x="44" y="50" width="1" height="6" rx="0.5" fill="#f59e0b" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0;0.7" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>
      <path d="M26 22 L42 35" stroke="#f59e0b" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="2 3">
        <animate attributeName="stroke-dashoffset" values="0;-5" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function SFTPIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sftp-folder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="sftp-arrow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <path d="M6 18 L6 52 Q6 54 8 54 L56 54 Q58 54 58 52 L58 22 Q58 20 56 20 L30 20 L26 14 Q25 12 23 12 L8 12 Q6 12 6 14 Z" fill="url(#sftp-folder)" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M6 22 L58 22" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.2" />
      <rect x="12" y="28" width="18" height="2" rx="1" fill="#3f3f46" opacity="0.5" />
      <rect x="12" y="33" width="14" height="2" rx="1" fill="#3f3f46" opacity="0.4" />
      <rect x="12" y="38" width="20" height="2" rx="1" fill="#3f3f46" opacity="0.3" />
      <rect x="12" y="43" width="12" height="2" rx="1" fill="#3f3f46" opacity="0.3" />
      <g>
        <line x1="44" y1="48" x2="44" y2="28" stroke="url(#sftp-arrow)" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="y2" values="28;26;28" dur="2s" repeatCount="indefinite" />
        </line>
        <path d="M40 32 L44 26 L48 32" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="d" values="M40 32 L44 26 L48 32;M40 30 L44 24 L48 30;M40 32 L44 26 L48 32" dur="2s" repeatCount="indefinite" />
        </path>
        <line x1="50" y1="28" x2="50" y2="48" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7">
          <animate attributeName="y1" values="28;30;28" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </line>
        <path d="M46 44 L50 48 L54 44" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
          <animate attributeName="d" values="M46 44 L50 48 L54 44;M46 46 L50 50 L54 46;M46 44 L50 48 L54 44" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </path>
      </g>
      <g>
        <circle cx="52" cy="16" r="7" fill="#09090b" stroke="#f97316" strokeWidth="1" />
        <rect x="50" y="13" width="4" height="3.5" rx="0.5" fill="none" stroke="#f97316" strokeWidth="0.8" />
        <rect x="49" y="16" width="6" height="4.5" rx="1" fill="#f97316" opacity="0.8" />
        <circle cx="52" cy="18" r="0.8" fill="#09090b" />
      </g>
    </svg>
  );
}

export function KBIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="kb-cover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="kb-page" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#1c1c1e" />
        </linearGradient>
      </defs>
      <path d="M10 12 Q10 8 14 8 L30 8 L30 52 Q20 50 10 52 Z" fill="url(#kb-cover)" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M54 12 Q54 8 50 8 L34 8 L34 52 Q44 50 54 52 Z" fill="url(#kb-cover)" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M30 8 L34 8 L34 52 L32 54 L30 52 Z" fill="#f97316" opacity="0.15" />
      <line x1="30" y1="8" x2="30" y2="52" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="34" y1="8" x2="34" y2="52" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.3" />
      <g opacity="0.7">
        <path d="M16 18 L20 14 L24 18 L24 26 L16 26 Z" fill="none" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
        <line x1="18" y1="20" x2="22" y2="20" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="20" y1="18" x2="20" y2="22" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.3" />
      </g>
      <rect x="15" y="30" width="12" height="1.5" rx="0.75" fill="#52525b" opacity="0.4" />
      <rect x="15" y="34" width="10" height="1.5" rx="0.75" fill="#52525b" opacity="0.3" />
      <rect x="15" y="38" width="12" height="1.5" rx="0.75" fill="#52525b" opacity="0.3" />
      <rect x="15" y="42" width="8" height="1.5" rx="0.75" fill="#52525b" opacity="0.25" />
      <rect x="38" y="14" width="12" height="1.5" rx="0.75" fill="#52525b" opacity="0.4" />
      <rect x="38" y="18" width="10" height="1.5" rx="0.75" fill="#52525b" opacity="0.3" />
      <rect x="38" y="22" width="12" height="1.5" rx="0.75" fill="#52525b" opacity="0.3" />
      <rect x="38" y="26" width="8" height="1.5" rx="0.75" fill="#52525b" opacity="0.25" />
      <g>
        <text x="38" y="36" fill="#06b6d4" fontSize="4.5" fontFamily="monospace" opacity="0">
          01101
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
        </text>
        <text x="38" y="41" fill="#f97316" fontSize="4.5" fontFamily="monospace" opacity="0">
          CVE-2
          <animate attributeName="opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </text>
        <text x="38" y="46" fill="#06b6d4" fontSize="4.5" fontFamily="monospace" opacity="0">
          0xF3A
          <animate attributeName="opacity" values="0;0.35;0" dur="3s" repeatCount="indefinite" begin="1s" />
        </text>
      </g>
      <circle cx="32" cy="56" r="2" fill="#f97316" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function ProfileIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="prof-hex" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.05" />
        </linearGradient>
        <clipPath id="prof-clip">
          <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" />
        </clipPath>
        <filter id="prof-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#prof-hex)" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.5" />
      <polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="none" stroke="#f97316" strokeWidth="0.4" strokeOpacity="0.15" />
      <g clipPath="url(#prof-clip)">
        <circle cx="32" cy="26" r="8" fill="#27272a" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="32" cy="24" r="4" fill="#3f3f46" />
        <ellipse cx="32" cy="30" rx="3.5" ry="2" fill="#3f3f46" />
        <ellipse cx="32" cy="46" rx="14" ry="10" fill="#27272a" stroke="#f97316" strokeWidth="0.6" strokeOpacity="0.3" />
      </g>
      <line x1="10" y1="20" x2="16" y2="24" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.15" />
      <line x1="54" y1="20" x2="48" y2="24" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.15" />
      <line x1="10" y1="44" x2="16" y2="40" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.15" />
      <line x1="54" y1="44" x2="48" y2="40" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.15" />
      <line x1="32" y1="4" x2="32" y2="10" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.2" />
      <line x1="32" y1="54" x2="32" y2="60" stroke="#f97316" strokeWidth="0.3" strokeOpacity="0.2" />
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0">
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
      </polygon>
    </svg>
  );
}
