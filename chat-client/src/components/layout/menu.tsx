"use client";

import { Group, Separator } from "@chakra-ui/react";
import { LuMoon, LuSun, LuSettings } from "react-icons/lu";
import { useColorMode } from "@/components/ui/color-mode";
import { MenuItem, MenuItemGroup } from "@/components/ui/menu";
import { DataListItem, DataListRoot } from "@/components/ui/data-list";

const stats = [
  { label: "Id", value: "sbyun" },
  { label: "Department", value: "Development" },
  { label: "Rank", value: "Enterprise" },
  { label: "Expire Date", value: "2025-12-12" },
];

export function UserMenu() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <MenuItemGroup title="Styles">
        <DataListRoot orientation="horizontal" p="2">
          {stats.map((item) => (
            <DataListItem
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </DataListRoot>
      </MenuItemGroup>
      <Separator />
      <MenuItem
        justifyContent="center"
        onClick={toggleColorMode}
        height={8}
        value="colorMode"
      >
        {colorMode === "light" ? <LuSun /> : <LuMoon />}
        Color Mode
      </MenuItem>
      <Separator />
      <Group gap="0" w="full" height={8}>
        {/* <MenuItem
          width="50%"
          justifyContent="center"
          height={8}
          value="setting"
        >
          <LuSettings size={20} />
          Setting
        </MenuItem>
        <Separator orientation="vertical" height={8} size="sm" /> */}
        <MenuItem
          width="100%"
          justifyContent="center"
          height={8}
          value="logout"
        >
          LogOut
        </MenuItem>
      </Group>
    </>
  );
}
