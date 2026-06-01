import type { Model3DElement } from "@/store/editor";

function shade(hex: string, amt: number) {
  const m = /^#?([a-f\d]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + Math.round((amt / 100) * 255));
  const g = clamp(((n >> 8) & 255) + Math.round((amt / 100) * 255));
  const b = clamp((n & 255) + Math.round((amt / 100) * 255));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const groundShadow: React.CSSProperties = {
  position: "absolute",
  left: "10%",
  right: "10%",
  bottom: "-6%",
  height: "10%",
  background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)",
  filter: "blur(2px)",
  pointerEvents: "none",
};

export function Model3DRender({ element }: { element: Model3DElement }) {
  const { color } = element;
  // Spin removed — spheres are static; spinSpeed kept on the type for back-compat.
  const animStyle: React.CSSProperties = {};

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 25%, ${shade(color, 55)} 0%, ${color} 38%, ${shade(color, -50)} 92%)`,
          boxShadow: `inset -18% -22% 38% ${shade(color, -55)}, inset 14% 12% 22% ${shade(color, 35)}, 0 14px 30px rgba(0,0,0,0.35)`,
          ...animStyle,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "22%",
          width: "30%",
          height: "20%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={groundShadow} />
    </div>
  );
}
