import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";

interface ItemRowSettingsDropdownProps {
  onDeleteClick: () => void;
}

export const ItemRowSettingsDropdown = ({
  onDeleteClick,
}: ItemRowSettingsDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="dropdown-menu"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
