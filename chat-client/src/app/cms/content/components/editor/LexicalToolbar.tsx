import { Box, HStack, IconButton } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

export function LexicalToolbar() {
  const [editor] = useLexicalComposerContext();
  const colors = useColors();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatHeading1 = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  const formatHeading2 = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  const formatHeading3 = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <Box
      p={2}
      borderBottomWidth={1}
      borderColor={colors.border}
      bg={colors.cardBg}
      borderTopRadius="md"
    >
      <HStack gap={1}>
        <IconButton
          aria-label="굵게"
          size="sm"
          variant="ghost"
          onClick={formatBold}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Bold size={18} />
        </IconButton>
        <IconButton
          aria-label="기울임"
          size="sm"
          variant="ghost"
          onClick={formatItalic}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Italic size={18} />
        </IconButton>
        <IconButton
          aria-label="밑줄"
          size="sm"
          variant="ghost"
          onClick={formatUnderline}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Underline size={18} />
        </IconButton>
        <Box w="1px" h="24px" bg={colors.border} mx={1} />
        <IconButton
          aria-label="제목 1"
          size="sm"
          variant="ghost"
          onClick={formatHeading1}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Heading1 size={18} />
        </IconButton>
        <IconButton
          aria-label="제목 2"
          size="sm"
          variant="ghost"
          onClick={formatHeading2}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Heading2 size={18} />
        </IconButton>
        <IconButton
          aria-label="제목 3"
          size="sm"
          variant="ghost"
          onClick={formatHeading3}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Heading3 size={18} />
        </IconButton>
        <Box w="1px" h="24px" bg={colors.border} mx={1} />
        <IconButton
          aria-label="순서 없는 목록"
          size="sm"
          variant="ghost"
          onClick={formatBulletList}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <List size={18} />
        </IconButton>
        <IconButton
          aria-label="순서 있는 목록"
          size="sm"
          variant="ghost"
          onClick={formatNumberedList}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <ListOrdered size={18} />
        </IconButton>
        <Box w="1px" h="24px" bg={colors.border} mx={1} />
        <IconButton
          aria-label="실행 취소"
          size="sm"
          variant="ghost"
          onClick={undo}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Undo size={18} />
        </IconButton>
        <IconButton
          aria-label="다시 실행"
          size="sm"
          variant="ghost"
          onClick={redo}
          color={colors.text.primary}
          _hover={{ bg: colors.bg }}
        >
          <Redo size={18} />
        </IconButton>
      </HStack>
    </Box>
  );
}
