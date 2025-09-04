import { Box, Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

interface CustomButtonProps extends ButtonProps {
  rightIcon?: React.ReactElement;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ rightIcon, children, ...props }) => {
  return (
    <Button {...props}>
      {children}
      {rightIcon && <Box ml={2}>{rightIcon}</Box>}
    </Button>
  );
}; 