import { useState } from "react";

const sizeMap = {
  sm: { container: "h-6 w-6", text: "text-[10px]", border: "border", icon: "h-3 w-3" },
  md: { container: "h-8 w-8", text: "text-xs", border: "border-[1.5px]", icon: "h-4 w-4" },
  lg: { container: "h-12 w-12", text: "text-base", border: "border-2", icon: "h-6 w-6" },
  xl: { container: "h-20 w-20", text: "text-2xl", border: "border-2", icon: "h-10 w-10" },
} as const;

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}

export default function UserAvatar({ avatarUrl, username, size = "md", className = "" }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const s = sizeMap[size];
  const initial = (username || "?").charAt(0).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={username || "User avatar"}
        className={`${s.container} rounded-full object-cover ${s.border} border-orange-500/40 bg-zinc-800 shrink-0 ${className}`}
        onError={() => setImgError(true)}
        data-testid="img-user-avatar"
      />
    );
  }

  return (
    <div
      className={`${s.container} rounded-full bg-orange-500/15 ${s.border} border-orange-500/30 flex items-center justify-center shrink-0 ${className}`}
      data-testid="fallback-user-avatar"
    >
      <span className={`${s.text} font-semibold text-orange-400 leading-none select-none`}>
        {initial}
      </span>
    </div>
  );
}
