// src/components/ui/themed-icons.tsx
// Inline SVG icons themed for Minecraft + Pokemon

interface IconProps {
  className?: string;
  size?: number;
}

/** Classic Pokeball icon */
export function PokeballIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
      <path d="M2 50h96" stroke="currentColor" strokeWidth="4" />
      <path d="M50 2a48 48 0 0 1 0 96" fill="none" />
      <path
        d="M50 2C74.5 2 94 21.5 94 46H6C6 21.5 25.5 2 50 2z"
        fill="#ff2d55"
        opacity="0.9"
      />
      <path
        d="M50 98C25.5 98 6 78.5 6 54h88c0 24.5-19.5 44-44 44z"
        fill="white"
        opacity="0.15"
      />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="4" fill="#0a0e1a" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
    </svg>
  );
}

/** Minecraft Diamond (pixel-style) */
export function DiamondIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="1" width="4" height="2" fill="#4ee8e8" />
      <rect x="4" y="3" width="2" height="2" fill="#4ee8e8" />
      <rect x="6" y="3" width="4" height="2" fill="#79f2f2" />
      <rect x="10" y="3" width="2" height="2" fill="#4ee8e8" />
      <rect x="2" y="5" width="2" height="2" fill="#2bbcbc" />
      <rect x="4" y="5" width="4" height="2" fill="#4ee8e8" />
      <rect x="8" y="5" width="4" height="2" fill="#2bbcbc" />
      <rect x="12" y="5" width="2" height="2" fill="#1a8a8a" />
      <rect x="3" y="7" width="2" height="2" fill="#2bbcbc" />
      <rect x="5" y="7" width="3" height="2" fill="#4ee8e8" />
      <rect x="8" y="7" width="3" height="2" fill="#2bbcbc" />
      <rect x="11" y="7" width="2" height="2" fill="#1a8a8a" />
      <rect x="4" y="9" width="2" height="2" fill="#2bbcbc" />
      <rect x="6" y="9" width="2" height="2" fill="#4ee8e8" />
      <rect x="8" y="9" width="2" height="2" fill="#2bbcbc" />
      <rect x="10" y="9" width="2" height="2" fill="#1a8a8a" />
      <rect x="5" y="11" width="2" height="2" fill="#2bbcbc" />
      <rect x="7" y="11" width="2" height="2" fill="#1a8a8a" />
      <rect x="9" y="11" width="2" height="2" fill="#1a8a8a" />
      <rect x="6" y="13" width="2" height="2" fill="#2bbcbc" />
      <rect x="8" y="13" width="2" height="2" fill="#1a8a8a" />
    </svg>
  );
}

/** Minecraft Sword (pixel-style) */
export function PixelSwordIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Blade */}
      <rect x="12" y="1" width="2" height="2" fill="#4ee8e8" />
      <rect x="10" y="3" width="2" height="2" fill="#4ee8e8" />
      <rect x="11" y="2" width="2" height="2" fill="#79f2f2" />
      <rect x="8" y="5" width="2" height="2" fill="#4ee8e8" />
      <rect x="9" y="4" width="2" height="2" fill="#79f2f2" />
      <rect x="6" y="7" width="2" height="2" fill="#79f2f2" />
      <rect x="7" y="6" width="2" height="2" fill="#4ee8e8" />
      {/* Guard */}
      <rect x="3" y="9" width="2" height="2" fill="#8B4513" />
      <rect x="5" y="9" width="2" height="2" fill="#D2691E" />
      <rect x="7" y="9" width="2" height="2" fill="#8B4513" />
      {/* Handle */}
      <rect x="4" y="11" width="2" height="2" fill="#8B4513" />
      <rect x="3" y="13" width="2" height="2" fill="#D2691E" />
    </svg>
  );
}

/** Minecraft Pickaxe (pixel-style) */
export function PickaxeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pickaxe head */}
      <rect x="5" y="1" width="2" height="2" fill="#4ee8e8" />
      <rect x="7" y="1" width="2" height="2" fill="#79f2f2" />
      <rect x="9" y="1" width="2" height="2" fill="#4ee8e8" />
      <rect x="11" y="1" width="2" height="2" fill="#2bbcbc" />
      <rect x="11" y="3" width="2" height="2" fill="#4ee8e8" />
      <rect x="9" y="3" width="2" height="2" fill="#79f2f2" />
      {/* Shaft */}
      <rect x="8" y="5" width="2" height="2" fill="#8B4513" />
      <rect x="7" y="7" width="2" height="2" fill="#8B4513" />
      <rect x="6" y="9" width="2" height="2" fill="#D2691E" />
      <rect x="5" y="11" width="2" height="2" fill="#8B4513" />
      <rect x="4" y="13" width="2" height="2" fill="#D2691E" />
    </svg>
  );
}

/** Pixel Heart (Minecraft/gaming style) */
export function PixelHeartIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="1" y="1" width="2" height="2" fill="#ff2d55" />
      <rect x="3" y="1" width="2" height="2" fill="#ff6b8a" />
      <rect x="5" y="1" width="2" height="2" fill="#ff2d55" />
      <rect x="9" y="1" width="2" height="2" fill="#ff2d55" />
      <rect x="11" y="1" width="2" height="2" fill="#ff6b8a" />
      <rect x="13" y="1" width="2" height="2" fill="#ff2d55" />
      <rect x="1" y="3" width="2" height="2" fill="#ff2d55" />
      <rect x="3" y="3" width="4" height="2" fill="#ff6b8a" />
      <rect x="7" y="1" width="2" height="2" fill="#ff2d55" />
      <rect x="7" y="3" width="2" height="2" fill="#ff6b8a" />
      <rect x="9" y="3" width="2" height="2" fill="#ff6b8a" />
      <rect x="11" y="3" width="2" height="2" fill="#ff2d55" />
      <rect x="13" y="3" width="2" height="2" fill="#cc0033" />
      <rect x="1" y="5" width="2" height="2" fill="#cc0033" />
      <rect x="3" y="5" width="4" height="2" fill="#ff2d55" />
      <rect x="7" y="5" width="4" height="2" fill="#ff2d55" />
      <rect x="11" y="5" width="2" height="2" fill="#cc0033" />
      <rect x="13" y="5" width="2" height="2" fill="#aa0022" />
      <rect x="2" y="7" width="2" height="2" fill="#cc0033" />
      <rect x="4" y="7" width="4" height="2" fill="#ff2d55" />
      <rect x="8" y="7" width="4" height="2" fill="#cc0033" />
      <rect x="12" y="7" width="2" height="2" fill="#aa0022" />
      <rect x="3" y="9" width="2" height="2" fill="#cc0033" />
      <rect x="5" y="9" width="4" height="2" fill="#ff2d55" />
      <rect x="9" y="9" width="2" height="2" fill="#cc0033" />
      <rect x="11" y="9" width="2" height="2" fill="#aa0022" />
      <rect x="5" y="11" width="2" height="2" fill="#cc0033" />
      <rect x="7" y="11" width="2" height="2" fill="#aa0022" />
      <rect x="9" y="11" width="2" height="2" fill="#aa0022" />
    </svg>
  );
}

/** Grass Block icon (Minecraft) */
export function GrassBlockIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Grass top */}
      <rect x="0" y="0" width="16" height="2" fill="#5B8731" />
      <rect x="0" y="2" width="4" height="2" fill="#6B9B3A" />
      <rect x="4" y="2" width="4" height="2" fill="#4A7528" />
      <rect x="8" y="2" width="4" height="2" fill="#6B9B3A" />
      <rect x="12" y="2" width="4" height="2" fill="#5B8731" />
      <rect x="0" y="4" width="4" height="2" fill="#4A7528" />
      <rect x="4" y="4" width="4" height="2" fill="#6B9B3A" />
      <rect x="8" y="4" width="4" height="2" fill="#5B8731" />
      <rect x="12" y="4" width="4" height="2" fill="#4A7528" />
      {/* Dirt */}
      <rect x="0" y="6" width="4" height="2" fill="#866043" />
      <rect x="4" y="6" width="4" height="2" fill="#9B7653" />
      <rect x="8" y="6" width="4" height="2" fill="#866043" />
      <rect x="12" y="6" width="4" height="2" fill="#7A5438" />
      <rect x="0" y="8" width="4" height="2" fill="#9B7653" />
      <rect x="4" y="8" width="4" height="2" fill="#7A5438" />
      <rect x="8" y="8" width="4" height="2" fill="#9B7653" />
      <rect x="12" y="8" width="4" height="2" fill="#866043" />
      <rect x="0" y="10" width="4" height="2" fill="#7A5438" />
      <rect x="4" y="10" width="4" height="2" fill="#866043" />
      <rect x="8" y="10" width="4" height="2" fill="#7A5438" />
      <rect x="12" y="10" width="4" height="2" fill="#9B7653" />
      <rect x="0" y="12" width="4" height="2" fill="#866043" />
      <rect x="4" y="12" width="4" height="2" fill="#7A5438" />
      <rect x="8" y="12" width="4" height="2" fill="#866043" />
      <rect x="12" y="12" width="4" height="2" fill="#7A5438" />
      <rect x="0" y="14" width="16" height="2" fill="#7A5438" />
    </svg>
  );
}

/** Creeper Face (Minecraft) */
export function CreeperFaceIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Face background */}
      <rect x="0" y="0" width="16" height="16" fill="#4CAF50" rx="2" />
      {/* Eyes */}
      <rect x="3" y="3" width="2" height="2" fill="#1B5E20" />
      <rect x="5" y="3" width="2" height="2" fill="#1B5E20" />
      <rect x="3" y="5" width="2" height="2" fill="#1B5E20" />
      <rect x="5" y="5" width="2" height="2" fill="#1B5E20" />
      <rect x="9" y="3" width="2" height="2" fill="#1B5E20" />
      <rect x="11" y="3" width="2" height="2" fill="#1B5E20" />
      <rect x="9" y="5" width="2" height="2" fill="#1B5E20" />
      <rect x="11" y="5" width="2" height="2" fill="#1B5E20" />
      {/* Mouth */}
      <rect x="6" y="7" width="2" height="2" fill="#1B5E20" />
      <rect x="8" y="7" width="2" height="2" fill="#1B5E20" />
      <rect x="5" y="9" width="2" height="2" fill="#1B5E20" />
      <rect x="7" y="9" width="2" height="2" fill="#1B5E20" />
      <rect x="9" y="9" width="2" height="2" fill="#1B5E20" />
      <rect x="5" y="11" width="2" height="2" fill="#1B5E20" />
      <rect x="9" y="11" width="2" height="2" fill="#1B5E20" />
    </svg>
  );
}

/** Star / Mega Evolution symbol */
export function MegaStarIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2z"
        fill="url(#megaGrad)"
        stroke="#ffd60a"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="megaGrad" x1="12" y1="2" x2="12" y2="22">
          <stop stopColor="#ffd60a" />
          <stop offset="1" stopColor="#ff8c00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Ender Pearl icon */
export function EnderPearlIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#1a3a2a" stroke="#00ff87" strokeWidth="1" opacity="0.8" />
      <circle cx="12" cy="12" r="7" fill="#0d2818" />
      <circle cx="12" cy="12" r="4" fill="#00ff87" opacity="0.6" />
      <circle cx="10" cy="10" r="2" fill="#00ff87" opacity="0.3" />
    </svg>
  );
}

/** Redstone icon */
export function RedstoneIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="1" width="4" height="2" fill="#ff2d55" />
      <rect x="4" y="3" width="2" height="2" fill="#cc0033" />
      <rect x="10" y="3" width="2" height="2" fill="#cc0033" />
      <rect x="6" y="3" width="4" height="2" fill="#ff4466" />
      <rect x="2" y="5" width="2" height="2" fill="#cc0033" />
      <rect x="12" y="5" width="2" height="2" fill="#cc0033" />
      <rect x="4" y="5" width="8" height="2" fill="#ff2d55" />
      <rect x="6" y="5" width="4" height="2" fill="#ff6b8a" />
      <rect x="2" y="7" width="2" height="2" fill="#cc0033" />
      <rect x="12" y="7" width="2" height="2" fill="#cc0033" />
      <rect x="4" y="7" width="8" height="2" fill="#ff2d55" />
      <rect x="4" y="9" width="2" height="2" fill="#cc0033" />
      <rect x="10" y="9" width="2" height="2" fill="#cc0033" />
      <rect x="6" y="9" width="4" height="2" fill="#ff2d55" />
      <rect x="6" y="11" width="4" height="2" fill="#cc0033" />
    </svg>
  );
}
