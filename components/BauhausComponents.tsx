/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

// Geometric Shape Icons
export const CircleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-current ${className}`}></div>
);

export const SquareIcon = ({ className }: { className?: string }) => (
  <div className={`bg-current ${className}`}></div>
);

export const TriangleIcon = ({ className }: { className?: string }) => (
  <div className={`w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-current ${className}`}></div>
);

export const HalfCircleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-t-full bg-current ${className}`}></div>
);

export const RectIcon = ({ className }: { className?: string }) => (
  <div className={`bg-current w-full h-[10px] my-1 ${className}`}></div>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-full h-[4px] bg-current"></div>
    <div className="absolute h-full w-[4px] bg-current"></div>
  </div>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="w-[4px] h-[12px] bg-current"></div>
    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-current -mt-1"></div>
    <div className="w-5 h-[4px] bg-current mt-1.5"></div>
  </div>
);

export const InfoIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center border border-current rounded-full ${className}`}>
    <div className="w-[15%] h-[15%] bg-current absolute top-[20%]"></div>
    <div className="w-[15%] h-[40%] bg-current absolute top-[45%]"></div>
  </div>
);

// Map icon string to component
export const getIcon = (type: string, className: string = "w-8 h-8") => {
  switch (type) {
    case 'circle': return <CircleIcon className={className} />;
    case 'triangle': return <TriangleIcon className={className} />;
    case 'square': return <SquareIcon className={className} />;
    case 'half-circle': return <HalfCircleIcon className={className} />;
    case 'rect': return <div className="flex flex-col gap-1"><RectIcon className="w-8" /><RectIcon className="w-8" /></div>;
    case 'plus': return <PlusIcon className={className} />;
    default: return <CircleIcon className={className} />;
  }
};

// Map color string to tailwind classes
export const getColorClass = (color: string, isBg: boolean = true) => {
  const map: Record<string, string> = {
    red: isBg ? 'bg-rose-500' : 'text-rose-500',
    blue: isBg ? 'bg-sky-500' : 'text-sky-500',
    yellow: isBg ? 'bg-amber-500' : 'text-amber-500',
    black: isBg ? 'bg-zinc-900' : 'text-zinc-50',
    white: isBg ? 'bg-zinc-950' : 'text-zinc-50',
    green: isBg ? 'bg-emerald-500' : 'text-emerald-500',
  };
  return map[color] || (isBg ? 'bg-zinc-950' : 'text-zinc-50');
};

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const BauhausButton: React.FC<BauhausButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = "relative font-light text-lg border border-zinc-800 p-4 transition-transform active:translate-x-1 active:translate-y-1 hover:-translate-y-1 hover:shadow-lg shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
  
  let colorClasses = "bg-zinc-950 text-zinc-50";
  if (variant === 'primary') colorClasses = "bg-sky-500 text-white";
  if (variant === 'danger') colorClasses = "bg-rose-500 text-white";
  if (variant === 'secondary') colorClasses = "bg-amber-500 text-zinc-50";

  return (
    <button className={`${baseClasses} ${colorClasses} ${className}`} {...props}>
      <div className="flex items-center justify-center gap-3">
        {icon}
        {children}
      </div>
    </button>
  );
};