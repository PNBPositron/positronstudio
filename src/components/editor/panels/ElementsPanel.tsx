import { PanelHeader } from "./TextPanel";
import { ShapesPanel } from "./ShapesPanel";
import { UploadsPanel } from "./UploadsPanel";

export function ElementsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <PanelHeader title="Elements" />
      <ShapesPanel />
      <UploadsPanel />
    </div>
  );
}
