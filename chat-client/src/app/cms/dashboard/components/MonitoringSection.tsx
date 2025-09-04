"use client";

import { Box } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { useColorMode } from "@/components/ui/color-mode";
import { useEffect, useMemo, useState } from "react";
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

interface MonitoringData {
  id: string;
  status: string;
  lastUpdate: string;
}

export function MonitoringSection() {
  const { colorMode } = useColorMode();
  const colors = useColors();
  const [rowData, setRowData] = useState<MonitoringData[]>([]);

  useEffect(() => {
    // Generate mock data
    const data = Array.from({ length: 20 }, (_, i) => ({
      id: `LED-${i + 1}`,
      status: Math.random() > 0.2 ? "on" : "off",
      lastUpdate: new Date().toLocaleTimeString(),
    }));
    setRowData(data);

    // Update data every 5 seconds
    const interval = setInterval(() => {
      setRowData((prevData) =>
        prevData.map((item) => ({
          ...item,
          status: Math.random() > 0.2 ? "on" : "off",
          lastUpdate: new Date().toLocaleTimeString(),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const columnDefs = useMemo<ColDef<MonitoringData>[]>(
    () => [
      { field: "id", headerName: "LED ID", width: 120 },
      {
        field: "status",
        headerName: "상태",
        width: 100,
        cellStyle: (params: CellClassParams<MonitoringData>) => ({
          backgroundColor:
            params.value === "on"
              ? colors.accent.success.default
              : colors.accent.warning.default,
          color: "white",
        }),
      },
      { field: "lastUpdate", headerName: "최종 업데이트", width: 150 },
    ],
    [colors]
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
        {...defaultGridOptions}
        columnDefs={columnDefs}
        rowData={rowData}
        animateRows={true}
        domLayout="autoHeight"
      />
    </Box>
  );
}
