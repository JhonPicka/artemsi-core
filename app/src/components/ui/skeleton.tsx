import type { CSSProperties } from "react";

type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width, height = 14, radius, className, style }: Props) {
  const merged: CSSProperties = {
    width,
    height,
    borderRadius: radius,
    ...style,
  };
  return <span className={`skeleton${className ? ` ${className}` : ""}`} style={merged} aria-hidden />;
}
