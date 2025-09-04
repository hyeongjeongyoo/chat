import { Box } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ErrorBoundary } from "react-error-boundary";

interface LexicalRendererProps {
  content: string;
  editable?: boolean;
}

export function LexicalRenderer({ editable = false }: LexicalRendererProps) {
  const colors = useColors();

  const initialConfig = {
    namespace: "LexicalRenderer",
    nodes: [HeadingNode, QuoteNode],
    onError: (error: Error) => {
      console.error(error);
    },
    editable,
  };

  return (
    <Box>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                color: colors.text.primary,
                background: colors.cardBg,
                padding: "1rem",
                borderRadius: "0.5rem",
                minHeight: "100px",
              }}
            />
          }
          placeholder={
            <Box color={colors.text.secondary} p={4}>
              내용을 입력하세요...
            </Box>
          }
          ErrorBoundary={(props) => (
            <ErrorBoundary
              {...props}
              fallbackRender={({ error }) => (
                <Box color="red.500">에러가 발생했습니다: {error.message}</Box>
              )}
            />
          )}
        />
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </LexicalComposer>
    </Box>
  );
}
