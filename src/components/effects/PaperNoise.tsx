import Image from "next/image";

export const PaperNoise = ({ textureAsset }: { textureAsset?: string }) => {
  return (
    <>
      {textureAsset && (
        <Image src={textureAsset} alt="" fill className="object-cover pointer-events-none opacity-20 mix-blend-overlay z-0" />
      )}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] mix-blend-overlay z-0" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </>
  );
};
