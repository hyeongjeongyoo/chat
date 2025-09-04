import {
  ListNode,
  ListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TRANSFORMERS } from "@lexical/markdown";
import { Box, Text, HStack, IconButton } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { TextNode } from "lexical";
import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import {
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  // ListOrdered,
  // Link,
  // Code,
  // Quote,
  // Table,
} from "lucide-react";

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function ToolbarPlugin() {
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
      bg="whiteAlpha.900"
      borderTopRadius="md"
    >
      <HStack gap={1}>
        <IconButton
          aria-label="굵게"
          size="sm"
          variant="ghost"
          onClick={formatBold}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Bold size={18} />
        </IconButton>
        <IconButton
          aria-label="기울임"
          size="sm"
          variant="ghost"
          onClick={formatItalic}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Italic size={18} />
        </IconButton>
        <IconButton
          aria-label="밑줄"
          size="sm"
          variant="ghost"
          onClick={formatUnderline}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
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
          _hover={{ bg: "gray.100" }}
        >
          <Heading1 size={18} />
        </IconButton>
        <IconButton
          aria-label="제목 2"
          size="sm"
          variant="ghost"
          onClick={formatHeading2}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Heading2 size={18} />
        </IconButton>
        <IconButton
          aria-label="제목 3"
          size="sm"
          variant="ghost"
          onClick={formatHeading3}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
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
          _hover={{ bg: "gray.100" }}
        >
          <List size={18} />
        </IconButton>
        <IconButton
          aria-label="순서 있는 목록"
          size="sm"
          variant="ghost"
          onClick={formatNumberedList}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        />
        <Box w="1px" h="24px" bg={colors.border} mx={1} />
        <IconButton
          aria-label="실행 취소"
          size="sm"
          variant="ghost"
          onClick={undo}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Undo size={18} />
        </IconButton>
        <IconButton
          aria-label="다시 실행"
          size="sm"
          variant="ghost"
          onClick={redo}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Redo size={18} />
        </IconButton>
        <IconButton
          aria-label="다시 실행"
          size="sm"
          variant="ghost"
          onClick={redo}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Redo size={18} />
        </IconButton>
        <IconButton
          aria-label="다시 실행"
          size="sm"
          variant="ghost"
          onClick={redo}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Redo size={18} />
        </IconButton>
        <IconButton
          aria-label="다시 실행"
          size="sm"
          variant="ghost"
          onClick={redo}
          color={colors.text.primary}
          _hover={{ bg: "gray.100" }}
        >
          <Redo size={18} />
        </IconButton>
        Link, Code, Quote, Table,
      </HStack>
    </Box>
  );
}

export default function LexicalEditor({}: LexicalEditorProps) {
  const colors = useColors();

  const theme = {
    paragraph: "mb-2",
    heading: {
      h1: "text-3xl font-bold mb-4",
      h2: "text-2xl font-bold mb-3",
      h3: "text-xl font-bold mb-2",
    },
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
    },
    editor: {
      background: colors.cardBg,
      borderColor: colors.border,
      color: colors.text.primary,
    },
    placeholder: {
      color: colors.text.secondary,
    },
  };

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      TextNode,
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
    ],
  };

  return (
    <Box>
      <Text mb={2}>내용</Text>
      <Box
        borderWidth={1}
        borderRadius="md"
        p={4}
        bg={colors.cardBg}
        borderColor={colors.border}
        _hover={{ borderColor: colors.primary.default }}
        _focusWithin={{ borderColor: colors.primary.default }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            <ToolbarPlugin />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input min-h-[200px] outline-none"
                  style={{
                    color: colors.text.primary,
                    backgroundColor: colors.cardBg,
                  }}
                />
              }
              placeholder={
                <div
                  className="editor-placeholder"
                  style={{
                    color: colors.text.secondary,
                  }}
                >
                  내용을 입력하세요...
                </div>
              }
              ErrorBoundary={() => (
                <Text color="red.500">에디터에 오류가 발생했습니다.</Text>
              )}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </LexicalComposer>
      </Box>
    </Box>
  );
}
