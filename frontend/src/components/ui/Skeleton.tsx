import styles from "./Skeleton.module.css";

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export default function Skeleton({ className = "", height, width }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${className}`}
      style={{ height, width }}
    />
  );
}
