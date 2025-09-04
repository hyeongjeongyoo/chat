import { Box, Text } from "@chakra-ui/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import { LexicalToolbar } from "./LexicalToolbar";
import { useColors } from "@/styles/theme";

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LexicalEditor({}: LexicalEditorProps) {
  const colors = useColors();

  const initialConfig = {
    namespace: "LexicalEditor",
    theme: {
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
    },
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeHighlightNode,
      CodeNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      LinkNode,
    ],
  };

  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      overflow="hidden"
      bg={colors.cardBg}
      borderColor={colors.border}
      _hover={{ borderColor: colors.primary.default }}
      _focusWithin={{ borderColor: colors.primary.default }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <Box className="editor-container" minH="300px">
          <LexicalToolbar />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.bg,
                  height: "300px",
                }}
              />
            }
            placeholder={
              <Box
                position="absolute"
                top="50px" // Adjust based on toolbar height + editor padding
                left="16px" // Adjust based on editor padding
                color={colors.text.secondary}
                pointerEvents="none"
              >
                Enter some text...
              </Box>
            }
            ErrorBoundary={() => (
              <Text color="red.500">에디터에 오류가 발생했습니다.</Text>
            )}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </Box>
      </LexicalComposer>
    </Box>
  );
}
