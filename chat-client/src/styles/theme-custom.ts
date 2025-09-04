import { defaultConfig } from "@chakra-ui/react";
import { defineConfig } from "@chakra-ui/react";
import { createSystem } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: "360px",
      md: "768px",
      lg: "1000px",
      xl: "1200px",
      "2xl": "1600px",
    },
  },
});

export default createSystem(defaultConfig, config);
