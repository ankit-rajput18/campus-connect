/**
 * UserAvatar — shows the user's Cloudinary photo if set,
 * otherwise renders a colored circle with their initials.
 *
 * Usage:
 *   <UserAvatar name="Ankit Rajput" avatar={user.avatar} size="md" />
 */

const COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
];

/** Pick a consistent color based on the name string */
function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

/** Get the first non-empty character from a name and uppercase it */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

const SIZE_MAP = {
  xs:  { outer: "h-6 w-6",   text: "text-[9px]",  ring: "ring-1" },
  sm:  { outer: "h-7 w-7",   text: "text-[10px]", ring: "ring-2" },
  md:  { outer: "h-9 w-9",   text: "text-xs",     ring: "ring-2" },
  lg:  { outer: "h-11 w-11", text: "text-sm",     ring: "ring-2" },
  xl:  { outer: "h-14 w-14", text: "text-base",   ring: "ring-2" },
  "2xl": { outer: "h-20 w-20", text: "text-xl",   ring: "ring-4" },
  "3xl": { outer: "h-24 w-24 sm:h-28 sm:w-28", text: "text-2xl", ring: "ring-4" },
};

type AvatarSize = keyof typeof SIZE_MAP;

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: AvatarSize;
  className?: string;
  /** Extra classes on the img/initials element itself */
  innerClassName?: string;
}

export function UserAvatar({
  name,
  avatar,
  size = "md",
  className = "",
  innerClassName = "",
}: UserAvatarProps) {
  const { outer, text, ring } = SIZE_MAP[size];
  const hasPhoto = avatar && avatar.trim() !== "";

  if (hasPhoto) {
    return (
      <img
        src={avatar!}
        alt={name}
        className={`${outer} rounded-full object-cover ${ring} ring-white shadow-sm ${className} ${innerClassName}`}
      />
    );
  }

  const initials = getInitials(name);
  const bg = colorFromName(name);

  return (
    <div
      className={`${outer} rounded-full ${bg} ${ring} ring-white shadow-sm flex items-center justify-center shrink-0 ${className}`}
      aria-label={name}
    >
      <span className={`${text} font-bold text-white leading-none ${innerClassName}`}>
        {initials}
      </span>
    </div>
  );
}
