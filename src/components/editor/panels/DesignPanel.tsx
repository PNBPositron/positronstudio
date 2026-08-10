import { ColorPanel } from "./ColorPanel";
import { SizePanel } from "./SizePanel";
import { BrandKitPanel } from "./BrandKitPanel";
import { DesignerPanel } from "./DesignerPanel";

export function DesignPanel() {
  return (
    <div className="space-y-6">
      <SizePanel />
      <div className="h-px bg-teal/20" />
      <DesignerPanel />
      <div className="h-px bg-teal/20" />
      <BrandKitPanel />
      <div className="h-px bg-teal/20" />
      <ColorPanel />
    </div>
  );
}
