"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { User } from "@/types/api";
import { ICellRendererParams } from "ag-grid-community";
import { EditIcon } from "lucide-react";

interface UserActionsCellRendererProps extends ICellRendererParams<User> {
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserActionsCellRenderer = (
  props: UserActionsCellRendererProps
) => {
  const { data, onEditUser } = props;

  if (!data) {
    return null;
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditUser(data);
  };

  return (
    <Box>
      <IconButton
        aria-label="Edit user"
        size="sm"
        variant="ghost"
        onClick={handleEdit}
      >
        <EditIcon size="16" />
      </IconButton>
    </Box>
  );
};
