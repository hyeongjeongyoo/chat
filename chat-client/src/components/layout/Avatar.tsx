import { Group, Separator, Text, Box, Portal } from "@chakra-ui/react";
import { Avatar as ChakraAvatar } from "@/components/ui/avatar";
import { LuSettings, LuMoon, LuSun, LuLogOut } from "react-icons/lu";
import { Menu as ChakraMenu } from "@chakra-ui/react";
import { DataListItem, DataListRoot } from "@/components/ui/data-list";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { useState, useEffect } from "react";
import { useColors } from "@/styles/theme";
import { useRecoilValue } from "recoil";
import { authState, useAuthActions } from "@/stores/auth";

interface AvatarProps {
  isSidebarOpen: boolean;
  asButton?: boolean;
  gradientBorder?: boolean;
}

type Placement = "bottom" | "right-start" | "right-end";

export function Avatar({
  isSidebarOpen,
  asButton = true,
  gradientBorder = false,
}: AvatarProps) {
  const [placement, setPlacement] = useState<Placement>("right-start");
  const colors = useColors();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { user } = useRecoilValue(authState);
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  // 홈페이지 스타일에 맞는 색상 적용
  const textColor = useColorModeValue(colors.text.primary, "whiteAlpha.900");
  const menuBg = useColorModeValue(colors.cardBg, colors.cardBg);
  const menuBorderColor = useColorModeValue(colors.border, "whiteAlpha.100");
  const menuItemHoverBg = useColorModeValue(
    colors.primary.alpha,
    "whiteAlpha.200"
  );
  const menuTextColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );
  const menuSubtitleColor = useColorModeValue(
    colors.text.secondary,
    "whiteAlpha.700"
  );
  const focusRingColor = useColorModeValue(
    colors.primary.alpha,
    "whiteAlpha.300"
  );
  const { toggleColorMode } = useColorMode();

  const stats = [
    { label: "Username", value: user?.username || "-" },
    // { label: "Email", value: user?.email || "-" },
    { label: "Role", value: user?.role || "-" },
  ];

  const avatarContent = (
    <>
      <Box
        position="relative"
        borderRadius="full"
        p={gradientBorder ? "2px" : "0"}
        bgGradient={gradientBorder ? colors.gradient.primary : undefined}
        boxShadow={
          gradientBorder
            ? `0 0 0 1px ${
                isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
              }`
            : "none"
        }
      >
        <ChakraAvatar
          size="2xs"
          name={user?.username || "User"}
          src={user?.avatar}
        />
      </Box>
      <Text
        color="inherit"
        overflow="hidden"
        opacity={isSidebarOpen ? 1 : 0}
        w={isSidebarOpen ? "full" : "0"}
        transition="all 0.2s ease-in-out"
        textAlign="left"
        whiteSpace="nowrap"
      >
        {user?.username || "User"}
      </Text>
    </>
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPlacement("bottom");
      } else {
        setPlacement(isSidebarOpen ? "right-start" : "right-end");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  if (!asButton) {
    return (
      <Box display="flex" alignItems="center" gap="6px" p="7px">
        {avatarContent}
      </Box>
    );
  }

  const hoverStyles = {
    bg: isDark ? "whiteAlpha.200" : colors.primary.alpha,
    color: isDark ? "whiteAlpha.900" : colors.primary.default,
  };

  return (
    <ChakraMenu.Root
      positioning={{
        placement,
        strategy: "fixed",
        offset: {
          mainAxis: 4,
          crossAxis: isSidebarOpen ? 0 : -4,
        },
      }}
    >
      <ChakraMenu.Trigger>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="start"
          h="10"
          ml="-9px"
          borderRadius="md"
          overflow="hidden"
          transition="all 0.2s ease-in-out"
          w={isSidebarOpen ? "120px" : "40px"}
          textAlign="center"
          p="8px"
          gap="6px"
          bg="transparent"
          color={textColor}
          _hover={hoverStyles}
          _active={hoverStyles}
          _expanded={hoverStyles}
          _focus={{
            outline: "none",
            boxShadow: `0 0 0 2px ${focusRingColor}`,
          }}
        >
          {avatarContent}
        </Box>
      </ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content
            p={0}
            bg={menuBg}
            borderWidth="1px"
            borderColor={menuBorderColor}
            borderRadius="xl"
            boxShadow={colors.shadow.md}
            backdropFilter="blur(8px)"
          >
            <ChakraMenu.ItemGroup>
              <DataListRoot orientation="horizontal" p="2">
                {stats.map((item) => (
                  <DataListItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    labelColor={menuSubtitleColor}
                    color={menuTextColor}
                  />
                ))}
              </DataListRoot>
            </ChakraMenu.ItemGroup>
            <Separator borderColor={menuBorderColor} />

            {/* <Separator borderColor={menuBorderColor} /> */}
            <Group gap="0" w="full" h="8">
              {/* <ChakraMenu.Item
                value="setting"
                width="50%"
                justifyContent="center"
                h="8"
                color={menuTextColor}
                _hover={{ bg: menuItemHoverBg, color: colors.primary.default }}
                _focus={{
                  outline: "none",
                  bg: menuItemHoverBg,
                  color: colors.primary.default,
                }}
              >
                <Box
                  as={LuSettings}
                  fontSize="20px"
                  color={colors.primary.default}
                  mr={1}
                />
                Setting
              </ChakraMenu.Item> */}
              <ChakraMenu.Item
                value="color-mode"
                width="50%"
                justifyContent="center"
                h="8"
                onClick={toggleColorMode}
                color={menuTextColor}
                _hover={{ bg: menuItemHoverBg, color: colors.primary.default }}
                _focus={{
                  outline: "none",
                  bg: menuItemHoverBg,
                  color: colors.primary.default,
                }}
              >
                <Box
                  as={isDark ? LuSun : LuMoon}
                  color={colors.primary.default}
                  fontSize="16px"
                  mr={1}
                />
                Color
              </ChakraMenu.Item>
              <Separator
                orientation="vertical"
                h="8"
                size="sm"
                borderColor={menuBorderColor}
              />
              <ChakraMenu.Item
                value="logout"
                width="50%"
                justifyContent="center"
                h="8"
                color={menuTextColor}
                onClick={handleLogout}
                _hover={{ bg: menuItemHoverBg, color: colors.primary.default }}
                _focus={{
                  outline: "none",
                  bg: menuItemHoverBg,
                  color: colors.primary.default,
                }}
              >
                <Box
                  as={LuLogOut}
                  fontSize="16px"
                  color={colors.primary.default}
                  mr={1}
                />
                LogOut
              </ChakraMenu.Item>
            </Group>
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}
