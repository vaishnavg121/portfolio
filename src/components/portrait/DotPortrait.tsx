import { useEffect, useRef } from "react";
import styles from "./DotPortrait.module.css";
import { enablePortraitMotion, PORTRAIT_ASSETS, WIDE_PORTRAIT } from "./portrait-interaction";

export function DotPortrait() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (root.current && canvas.current) return enablePortraitMotion(root.current, canvas.current);
  }, []);

  return (
    <figure ref={root} className={styles.portrait} data-dot-portrait>
      <picture className={styles.picture}>
        <source media={WIDE_PORTRAIT} srcSet={`${PORTRAIT_ASSETS}/wide.webp`} />
        <img
          src={`${PORTRAIT_ASSETS}/compact.webp`}
          alt="Vaishnav Gadamsetty rendered in warm halftone dots"
          width={390}
          height={390}
          decoding="async"
          fetchPriority="low"
        />
      </picture>
      <canvas ref={canvas} className={styles.surface} aria-hidden="true" />
    </figure>
  );
}
