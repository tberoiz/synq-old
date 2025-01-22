import { Label } from "@repo/ui/label";
import { memo } from "react";

function ItemDetailsForm() {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-left">Stock:</Label>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-left">Relation:</Label>
      </div>
    </div>
  );
}
export default memo(ItemDetailsForm);
