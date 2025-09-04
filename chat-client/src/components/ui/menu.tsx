"use client";

import { AbsoluteCenter, Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import * as React from "react";
import { LuCheck, LuChevronRight } from "react-icons/lu";
import { useState, useEffect } from "react";

interface MenuContentProps extends ChakraMenu.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props;
    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content
            ref={ref}
            style={{ position: "relative" }}
            {...rest}
          />
        </ChakraMenu.Positioner>
      </Portal>
    );
  }
);

export const MenuArrow = React.forwardRef<
  HTMLDivElement,
  ChakraMenu.ArrowProps
>(function MenuArrow(props, ref) {
  return (
    <ChakraMenu.Arrow ref={ref} {...props}>
      <ChakraMenu.ArrowTip />
    </ChakraMenu.Arrow>
  );
});

export const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  ChakraMenu.CheckboxItemProps
>(function MenuCheckboxItem(props, ref) {
  return (
    <ChakraMenu.CheckboxItem ref={ref} {...props}>
      <ChakraMenu.ItemIndicator hidden={false}>
        <LuCheck />
      </ChakraMenu.ItemIndicator>
      {props.children}
    </ChakraMenu.CheckboxItem>
  );
});

export const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  ChakraMenu.RadioItemProps
>(function MenuRadioItem(props, ref) {
  const { children, ...rest } = props;
  return (
    <ChakraMenu.RadioItem ps="8" ref={ref} {...rest}>
      <AbsoluteCenter axis="horizontal" left="4" asChild>
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      <ChakraMenu.ItemText>{children}</ChakraMenu.ItemText>
    </ChakraMenu.RadioItem>
  );
});

export const MenuItemGroup = React.forwardRef<
  HTMLDivElement,
  ChakraMenu.ItemGroupProps
>(function MenuItemGroup(props, ref) {
  const { title, children, ...rest } = props;
  return (
    <ChakraMenu.ItemGroup ref={ref} {...rest}>
      {title && (
        <ChakraMenu.ItemGroupLabel userSelect="none">
          {title}
        </ChakraMenu.ItemGroupLabel>
      )}
      {children}
    </ChakraMenu.ItemGroup>
  );
});

export interface MenuTriggerItemProps extends ChakraMenu.ItemProps {
  startIcon?: React.ReactNode;
}

export const MenuTriggerItem = React.forwardRef<
  HTMLDivElement,
  MenuTriggerItemProps
>(function MenuTriggerItem(props, ref) {
  const { startIcon, children, ...rest } = props;
  return (
    <ChakraMenu.TriggerItem ref={ref} {...rest}>
      {startIcon}
      {children}
      <LuChevronRight />
    </ChakraMenu.TriggerItem>
  );
});

export const MenuRadioItemGroup = ChakraMenu.RadioItemGroup;
export const MenuContextTrigger = ChakraMenu.ContextTrigger;

export const MenuItem = ChakraMenu.Item;
export const MenuItemText = ChakraMenu.ItemText;
export const MenuItemCommand = ChakraMenu.ItemCommand;
export const MenuTrigger = ChakraMenu.Trigger;

type PlacementType = "bottom" | "right-start" | "right" | "right-end";
type TriggerType =
  | "top-bar-avatar-menu-trigger"
  | "side-bar-avatar-menu-trigger-open"
  | "side-bar-avatar-menu-trigger-closed";

interface ResponsivePositioning {
  base?: {
    placement?: PlacementType;
  };
  md?: {
    placement?: PlacementType;
  };
}

interface MenuRootIds {
  base?: {
    trigger?: TriggerType;
  };
  md?: {
    trigger?: TriggerType;
  };
}

interface MenuRootProps
  extends Omit<ChakraMenu.RootProps, "positioning" | "ids"> {
  positioning?: ResponsivePositioning | { placement?: PlacementType };
  ids?: MenuRootIds | { trigger?: TriggerType };
  children: React.ReactNode;
}

export function MenuRoot({
  ids,
  positioning,
  children,
  ...props
}: MenuRootProps) {
  const [placement, setPlacement] = useState<PlacementType>("bottom");
  const [triggerId, setTriggerId] = useState<TriggerType>(
    "side-bar-avatar-menu-trigger-open"
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;

      // Calculate new values
      let newPlacement: PlacementType;
      let newTriggerId: TriggerType;

      if (!positioning || !("base" in positioning)) {
        newPlacement =
          (positioning as { placement?: PlacementType })?.placement || "bottom";
      } else {
        newPlacement = isMobile
          ? positioning.base?.placement || "bottom"
          : positioning.md?.placement || "right-end";
      }

      if (!ids || !("base" in ids)) {
        newTriggerId =
          (ids as { trigger?: TriggerType })?.trigger ||
          "side-bar-avatar-menu-trigger-open";
      } else {
        newTriggerId = isMobile
          ? ids.base?.trigger || "top-bar-avatar-menu-trigger"
          : ids.md?.trigger || "side-bar-avatar-menu-trigger-closed";
      }

      setPlacement(newPlacement);
      setTriggerId(newTriggerId);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [positioning, ids]);

  return (
    <ChakraMenu.Root
      {...props}
      positioning={{
        placement,
        gutter: 4,
        strategy: "absolute",
        offset: { mainAxis: 4, crossAxis: 0 },
        flip: true,
        shift: 10,
        overlap: false,
      }}
      ids={{ trigger: triggerId }}
    >
      {children}
    </ChakraMenu.Root>
  );
}
