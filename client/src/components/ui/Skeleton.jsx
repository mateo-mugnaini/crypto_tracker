import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./Skeleton.module.css";
export default function Skeleton({ className = "", height, width }) {
  return _jsx("span", {
    "aria-hidden": "true",
    className: `${styles.skeleton} ${className}`,
    style: { height, width },
  });
}
