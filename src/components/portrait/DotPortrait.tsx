import styles from "./DotPortrait.module.css";

const assets = "/images/dot-portrait";

export function DotPortrait() {
  return (
    <figure className={styles.portrait} data-dot-portrait>
      <picture className={styles.picture}>
        <source media="(min-width: 64rem)" srcSet={`${assets}/wide.webp`} />
        <img
          src={`${assets}/compact.webp`}
          alt="Vaishnav Gadamsetty rendered in warm halftone dots"
          width={348}
          height={342}
          decoding="async"
          fetchPriority="low"
        />
      </picture>
    </figure>
  );
}
