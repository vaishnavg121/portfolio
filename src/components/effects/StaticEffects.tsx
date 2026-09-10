"use client";

export const GridEffect = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    />
  );
};

export const BlueprintEffect = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[#0a1128]"
      style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
    />
  );
};
