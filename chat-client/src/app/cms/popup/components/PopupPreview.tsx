"use client";

import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { Popup } from "@/types/api";

// --- Lexical Imports for Rendering ---
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { baseInitialConfig } from "@/lib/lexicalConfig";

// Simple Error Boundary for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  // A simple error boundary component.
  return <>{children}</>;
}

interface PopupPreviewProps {
  popup: Popup | null;
}

export function PopupPreview({ popup }: PopupPreviewProps) {
  const initialConfig = React.useMemo(() => {
    return {
      ...baseInitialConfig,
      namespace: `PopupPreview-${popup?.id || Date.now()}`,
      editable: false,
      editorState: popup?.content || null,
    };
  }, [popup]);

  if (!popup) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" h="full">
        <Text color="gray.500">
          선택된 팝업이 없습니다. 목록에서 팝업을 선택해주세요.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={4}
        minH="200px"
      >
        {popup.content ? (
          <LexicalErrorBoundary>
            <LexicalComposer key={popup.id} initialConfig={initialConfig}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable style={{ outline: "none" }} />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <ListPlugin />
              <LinkPlugin />
            </LexicalComposer>
          </LexicalErrorBoundary>
        ) : (
          <Text color="gray.400">내용이 없습니다.</Text>
        )}
      </Box>
    </Box>
  );
}
