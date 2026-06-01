import { ColorPanel } from "./ColorPanel";
import { SizePanel } from "./SizePanel";

export function DesignPanel() {
  return (
    <div className="space-y-6">
      <SizePanel />
      <div className="h-px bg-teal/20" />
      <ColorPanel />
    </div>
  );
}