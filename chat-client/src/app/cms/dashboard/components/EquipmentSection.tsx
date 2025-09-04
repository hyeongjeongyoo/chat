"use client";

import { Box } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { useColorMode } from "@/components/ui/color-mode";
import { useMemo } from "react";
import {
  ColDef,
  CellClassParams,
  ModuleRegistry,
  CellStyleModule,
  ClientSideRowModelModule,
} from "ag-grid-community";
import {
  defaultGridOptions,
  themeDarkMode,
  themeLightMode,
} from "@/lib/ag-grid-config";
import { useColors } from "@/styles/theme";

// Register required modules
ModuleRegistry.registerModules([ClientSideRowModelModule, CellStyleModule]);

interface EquipmentData {
  id: string;
  status: string;
  temperature: string;
  lastCheck: string;
}

export function EquipmentSection() {
  const { colorMode } = useColorMode();
  const colors = useColors();

  const columnDefs = useMemo<ColDef<EquipmentData>[]>(
    () => [
      { field: "id", headerName: "장비 ID", width: 120 },
      {
        field: "status",
        headerName: "상태",
        width: 100,
        cellStyle: (params: CellClassParams<EquipmentData>) => ({
          backgroundColor:
            params.value === "normal"
              ? colors.accent.info.default
              : colors.accent.warning.default,
          color: "white",
        }),
      },
      { field: "temperature", headerName: "온도", width: 100 },
      { field: "lastCheck", headerName: "최종 점검", width: 150 },
    ],
    [colors]
  );

  const rowData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `EQ-${i + 1}`,
        status: Math.random() > 0.3 ? "normal" : "warning",
        temperature: `${Math.floor(Math.random() * 30 + 20)}°C`,
        lastCheck: new Date().toLocaleTimeString(),
      })),
    []
  );

  return (
    <Box
      h="full"
      borderRadius="xl"
      overflow="hidden"
      boxShadow={colors.shadow.sm}
    >
      <AgGridReact
        className="ag-theme-quartz"
        theme={colorMode === "dark" ? themeDarkMode : themeLightMode}
        enableCellTextSelection={true}
        {...defaultGridOptions}
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows={true}
        domLayout="autoHeight"
      />
    </Box>
  );
}
