import { Badge } from "@synq/ui/badge";
import { cn } from "@synq/ui/utils";

interface ArchiveStatusBadgeProps {
  isArchived: boolean;
}

/**
 * Displays a badge indicating whether an entity is Archived or Active.
 *
 * @param isArchived - Boolean indicating if the entity is archived
 */
export default function ArchiveStatusBadge({
  isArchived,
}: ArchiveStatusBadgeProps) {
  const status = isArchived ? "Archived" : "Active";
  const statusStyles = isArchived
    ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300"
    : "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "transition-colors hover:bg-opacity-80 dark:hover:bg-opacity-30",
        statusStyles,
      )}
      aria-label={`Status: ${status}`}
    >
      {status}
    </Badge>
  );
}
