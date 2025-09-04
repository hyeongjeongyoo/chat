import { DecoratorNode, NodeKey } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import React from "react";
import { InitialConfigType } from "@lexical/react/LexicalComposer";

// --- Custom Image Node ---
// Define a type for the serialized image node data
export type SerializedImageNode = {
  type: "image";
  src: string;
  altText?: string;
  version: 1;
  // fileId is no longer part of the node's persistent state for new images
};

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText?: string;
  // __fileId is removed as it's not consistently available at node creation
  // If needed for existing content that has fileId, importJSON might handle it gracefully

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.getKey());
  }

  // Constructor updated: fileId removed
  constructor(src: string, altText?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  // exportJSON method to serialize the node state
  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      src: this.__src,
      altText: this.__altText,
      version: 1,
    };
  }

  // importJSON method to deserialize and create a new node instance
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      // fileId is not present in SerializedImageNode for new nodes
    });
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.textAlign = "center";
    const img = document.createElement("img");

    img.src = this.__src;
    img.alt = this.__altText || "Image";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    div.appendChild(img);
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return null;
  }
}

export function $createImageNode({
  src,
  altText,
}: {
  src: string;
  altText?: string;
}): ImageNode {
  return new ImageNode(src, altText);
}

// --- Custom Video Node ---
// Define a type for the serialized video node data
export type SerializedVideoNode = {
  type: "video";
  src: string;
  version: 1;
  // fileId is no longer part of the node's persistent state
};

export class VideoNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  // __fileId is removed

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.getKey());
  }

  // Constructor updated: fileId removed
  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  // exportJSON method to serialize the node state
  exportJSON(): SerializedVideoNode {
    return {
      type: "video",
      src: this.__src,
      version: 1,
    };
  }

  // importJSON method to deserialize and create a new node instance
  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return $createVideoNode({ src: serializedNode.src });
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.textAlign = "center";
    const video = document.createElement("video");

    video.src = this.__src;
    video.controls = true;
    video.style.maxWidth = "100%";
    div.appendChild(video);
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return null;
  }
}

export function $createVideoNode({ src }: { src: string }): VideoNode {
  return new VideoNode(src);
}

// --- Editor Theme ---
export const editorTheme = {
  paragraph: "editor-paragraph",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    code: "editor-text-code",
  },
  heading: { h1: "editor-heading-h1", h2: "editor-heading-h2" },
  list: {
    ul: "editor-list-ul",
    ol: "editor-list-ol",
    listitem: "editor-listitem",
  },
  link: "editor-link",
  quote: "editor-quote",
  code: "editor-code",
  image: "editor-image",
  video: "editor-video",
};

// --- Editor Nodes ---
export const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  ImageNode,
  VideoNode,
];

// --- Base Initial Config ---
export const baseInitialConfig: Omit<InitialConfigType, "editorState"> = {
  namespace: "SharedLexicalEditor",
  theme: editorTheme,
  nodes: editorNodes,
  onError(error: Error) {
    console.error("Lexical Error:", error);
  },
};
