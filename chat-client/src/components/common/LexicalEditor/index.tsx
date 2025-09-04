"use client";
// --- Lexical Core and Plugins ---
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { mergeRegister } from "@lexical/utils";

// --- Lexical Nodes ---
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  LexicalNode,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";

// --- UI Components ---
import { Button, HStack, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import React, { useState, useCallback, useEffect, memo, useMemo } from "react";
import {
  Bold,
  Italic,
  Underline,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

// --- Import Shared Config ---
import {
  baseInitialConfig,
  $createImageNode,
  $createVideoNode,
} from "@/lib/lexicalConfig";

// --- Toolbar ---
const Toolbar = memo(function Toolbar({
  articleId,
  editorContextMenu,
  onMediaAdded,
}: {
  articleId?: number;
  editorContextMenu: LexicalEditorProps["contextMenu"];
  onMediaAdded?: (localUrl: string, file: File) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      const anchorNode = selection.anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElementOrThrow();

      let currentBlockType = "paragraph";
      let parentNode: LexicalNode | null = topLevelElement;
      while (parentNode !== null && parentNode.getKey() !== "root") {
        if ($isHeadingNode(parentNode)) {
          currentBlockType = parentNode.getTag();
          break;
        }
        if ($isListNode(parentNode)) {
          currentBlockType = parentNode.getListType();
          break;
        }
        parentNode = parentNode.getParent();
      }
      setBlockType(currentBlockType);

      const node = selection.anchor.getNode();
      const parent = node ? node.getParent() : null;
      setIsLink($isLinkNode(node) || $isLinkNode(parent));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  const formatHeading = useCallback(
    (level: 1 | 2) => {
      const headingTag = `h${level}`;
      if (blockType !== headingTag) {
        editor.update(() => {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            $setBlocksType(sel, () =>
              $createHeadingNode(headingTag as HeadingTagType)
            );
          }
        });
      } else {
        editor.update(() => {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            $setBlocksType(sel, () => $createParagraphNode());
          }
        });
      }
    },
    [editor, blockType]
  );

  const formatList = useCallback(
    (type: "ul" | "ol") => {
      const listType = type === "ul" ? "bullet" : "number";
      if (blockType !== listType) {
        editor.dispatchCommand(
          type === "ul"
            ? INSERT_UNORDERED_LIST_COMMAND
            : INSERT_ORDERED_LIST_COMMAND,
          undefined
        );
      } else {
        editor.update(() => {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            $setBlocksType(sel, () => $createParagraphNode());
          }
        });
      }
    },
    [editor, blockType]
  );

  const formatLink = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt("Enter the URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  }, [editor, isLink]);

  const insertMedia = useCallback(
    async (type: "image" | "video") => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = type === "image" ? "image/*" : "video/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          const localUrl = URL.createObjectURL(file);

          // Restore focus to the editor before inserting the image.
          // This is crucial because opening the file dialog causes the editor to lose focus.
          editor.focus();

          editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
              const node =
                type === "image"
                  ? $createImageNode({
                      src: localUrl,
                      altText: file.name,
                    })
                  : $createVideoNode({
                      src: localUrl,
                    });
              sel.insertNodes([node]);
            }
          });

          if (onMediaAdded) {
            onMediaAdded(localUrl, file);
          }

          toaster.success({
            title: "미디어가 추가되었습니다.",
            description: "게시글이 저장될 때 미디어가 업로드됩니다.",
            duration: 3000,
          });
        }
      };
      input.click();
    },
    [editor, onMediaAdded]
  );

  return (
    <HStack gap={1} mb={2} wrap="wrap">
      <Button
        size="xs"
        variant={isBold ? "solid" : "ghost"}
        colorPalette={isBold ? "blue" : "gray"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold size={16} />
      </Button>
      <Button
        size="xs"
        variant={isItalic ? "solid" : "ghost"}
        colorPalette={isItalic ? "blue" : "gray"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic size={16} />
      </Button>
      <Button
        size="xs"
        variant={isUnderline ? "solid" : "ghost"}
        colorPalette={isUnderline ? "blue" : "gray"}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline size={16} />
      </Button>
      <Button
        size="xs"
        variant={blockType === "h1" ? "solid" : "ghost"}
        colorPalette={blockType === "h1" ? "blue" : "gray"}
        onClick={() => formatHeading(1)}
      >
        <Heading1 size={16} />
      </Button>
      <Button
        size="xs"
        variant={blockType === "h2" ? "solid" : "ghost"}
        colorPalette={blockType === "h2" ? "blue" : "gray"}
        onClick={() => formatHeading(2)}
      >
        <Heading2 size={16} />
      </Button>
      <Button
        size="xs"
        variant={blockType === "bullet" ? "solid" : "ghost"}
        colorPalette={blockType === "bullet" ? "blue" : "gray"}
        onClick={() => formatList("ul")}
      >
        <List size={16} />
      </Button>
      <Button
        size="xs"
        variant={blockType === "number" ? "solid" : "ghost"}
        colorPalette={blockType === "number" ? "blue" : "gray"}
        onClick={() => formatList("ol")}
      >
        <ListOrdered size={16} />
      </Button>
      <Button
        size="xs"
        variant={isLink ? "solid" : "ghost"}
        colorPalette={isLink ? "blue" : "gray"}
        onClick={formatLink}
      >
        <LinkIcon size={16} />
      </Button>
      <Button size="xs" variant="ghost" onClick={() => insertMedia("image")}>
        <ImageIcon size={16} />
      </Button>
      <Button size="xs" variant="ghost" onClick={() => insertMedia("video")}>
        <VideoIcon size={16} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
      >
        <Undo2 size={16} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
      >
        <Redo2 size={16} />
      </Button>
    </HStack>
  );
});

// --- Error Boundary ---
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>; // Simple fallback
}

// --- Lexical Editor Component (Reusable) ---
interface LexicalEditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  placeholder?: string;
  articleId?: number;
  contextMenu: "BBS" | "POPUP" | "CONTENT" | "PROGRAM";
  onMediaAdded?: (localUrl: string, file: File) => void;
}

export function LexicalEditor({
  onChange,
  initialContent,
  placeholder = "내용을 입력해주세요",
  articleId,
  contextMenu,
  onMediaAdded,
}: LexicalEditorProps) {
  const initialConfig = useMemo(
    () => ({
      ...baseInitialConfig,
      editorState: initialContent ? initialContent : undefined,
      namespace: `LexicalEditorInstance-${
        articleId || initialContent?.substring(0, 10) || Date.now()
      }`,
    }),
    [initialContent, articleId]
  );

  const onLexicalChange = useCallback(
    (editorState: any) => {
      if (onChange) {
        onChange(JSON.stringify(editorState));
      }
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar
        articleId={articleId}
        editorContextMenu={contextMenu}
        onMediaAdded={onMediaAdded}
      />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            style={{
              minHeight: 160,
              borderRadius: 8,
              padding: 16,
              outline: "none",
              border: "1px solid #e2e8f0",
            }}
          />
        }
        placeholder={<Text color="gray.400">{placeholder}</Text>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ListPlugin />
      <LinkPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={onLexicalChange} />
    </LexicalComposer>
  );
}
