import React from "react";
import { Badge } from "@chakra-ui/react";
import { UiDisplayStatus } from "@/types/statusTypes";
import { displayStatusConfig } from "@/lib/utils/statusUtils";

interface CommonPayStatusBadgeProps {
  status?: UiDisplayStatus | string | null;
}

export const CommonPayStatusBadge = ({ status }: CommonPayStatusBadgeProps) => {
  if (!status) {
    return (
      <Badge colorPalette="gray" variant="outline" size="sm">
        N/A
      </Badge>
    );
  }

  const config =
    displayStatusConfig[status as UiDisplayStatus] ||
    displayStatusConfig["FAILED"]; // Fallback to a default for unknown statuses

  return (
    <Badge
      colorPalette={config.colorPalette}
      variant={config.badgeVariant || "solid"}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};
