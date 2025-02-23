import { LayoutGrid, TableProperties } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { Button } from "@synq/ui/button";

interface LayoutToggleProps {
  layout: "table" | "grid";
  onLayoutChange: (layout: "table" | "grid") => void;
}

export function LayoutToggleDropdown({
  layout,
  onLayoutChange,
}: LayoutToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {layout === "table" ? (
            <TableProperties className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onLayoutChange("grid")}>
          <LayoutGrid className="mr-2 h-4 w-4" /> Grid View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLayoutChange("table")}>
          <TableProperties className="mr-2 h-4 w-4" /> Table View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
