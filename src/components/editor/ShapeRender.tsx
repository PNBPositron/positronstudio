import type { ShapeElement } from "@/store/editor";

export function ShapeRender({ element }: { element: ShapeElement }) {
  const { shape, fill, stroke, strokeWidth, width, height } = element;
  const common = {
    width: "100%",
    height: "100%",
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: "none" as const,
  };
  if (shape === "rect") {
    return (
      <svg {...common}>
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width - strokeWidth}
          height={height - strokeWidth}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }
  if (shape === "circle") {
    return (
      <svg {...common}>
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2 - strokeWidth / 2}
          ry={height / 2 - strokeWidth / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }
  if (shape === "triangle") {
    return (
      <svg {...common}>
        <polygon
          points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height - strokeWidth} ${strokeWidth},${height - strokeWidth}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  if (shape === "star") {
    const cx = width / 2, cy = height / 2;
    const rO = Math.min(width, height) / 2 - strokeWidth;
    const rI = rO * 0.45;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rO : rI;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    return (
      <svg {...common}>
        <polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      </svg>
    );
  }
  if (shape === "arrow") {
    const h = height;
    const w = width;
    const tail = h * 0.3;
    const headW = w * 0.35;
    return (
      <svg {...common}>
        <polygon
          points={`${strokeWidth},${h / 2 - tail / 2} ${w - headW},${h / 2 - tail / 2} ${w - headW},${strokeWidth} ${w - strokeWidth},${h / 2} ${w - headW},${h - strokeWidth} ${w - headW},${h / 2 + tail / 2} ${strokeWidth},${h / 2 + tail / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  return null;
}
