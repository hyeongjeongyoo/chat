import { Post, BoardArticleCommon } from "@/types/api";
import { CommonCardData } from "@/types/common";
import { getPublicFileDownloadUrl } from "@/lib/utils";

// Helper to extract the first image src (full URL) from Lexical content string
const getFirstImageSrcFromContent = (
  contentJsonString: string | null | undefined
): string | null => {
  if (!contentJsonString) return null;
  try {
    const content = JSON.parse(contentJsonString);
    if (content && content.root && content.root.children) {
      const findImageNode = (nodes: any[]): string | null => {
        for (const node of nodes) {
          if (
            node.type === "image" &&
            node.src &&
            typeof node.src === "string" &&
            (node.src.startsWith("http://") || node.src.startsWith("https://"))
          ) {
            return node.src;
          }
          if (node.children && Array.isArray(node.children)) {
            const foundInChild = findImageNode(node.children);
            if (foundInChild) return foundInChild;
          }
          if (
            node.type === "listitem" && // Added for completeness, though may not always contain direct images
            node.children &&
            Array.isArray(node.children)
          ) {
            const foundInListItem = findImageNode(node.children);
            if (foundInListItem) return foundInListItem;
          }
        }
        return null;
      };
      return findImageNode(content.root.children);
    }
  } catch (error) {
    console.error("Error parsing article content for image URL:", error);
  }
  return null;
};

// Helper to extract plain text from Lexical content string
const getTextFromLexicalContent = (
  contentJsonString: string | null | undefined
): string => {
  if (!contentJsonString || typeof contentJsonString !== "string") return "";
  try {
    const content = JSON.parse(contentJsonString);
    let extractedText = "";

    const traverseNodes = (nodes: any[]) => {
      if (!nodes || !Array.isArray(nodes)) return;
      for (const node of nodes) {
        if (node.type === "text" && typeof node.text === "string") {
          extractedText += node.text + " ";
        }
        if (node.children && Array.isArray(node.children)) {
          traverseNodes(node.children);
        }
      }
    };

    if (content && content.root && content.root.children) {
      traverseNodes(content.root.children);
    }
    return extractedText.trim();
  } catch (error) {
    console.error("Error parsing Lexical content for text extraction:", error);
    return "";
  }
};

export function mapPostToCommonCardData(
  post: Post,
  currentPathId: string
): CommonCardData {
  let displayThumbnailUrl: string | null = post.thumbnailUrl || null; // Start with direct thumbnailUrl

  // Fallback 1: Try to get from content (assuming it might be Lexical JSON)
  if (!displayThumbnailUrl) {
    // Assuming post.content might be Lexical JSON.
    // Add a try-catch here specifically for content parsing if it can be non-JSON HTML.
    try {
      const firstImageSrc = getFirstImageSrcFromContent(post.content);
      if (firstImageSrc) {
        displayThumbnailUrl = firstImageSrc;
      }
    } catch (error) {
      // console.warn("Could not parse post.content as JSON for thumbnail for post:", post.nttId, error);
      // If content is HTML and we need to parse it, a different strategy would be needed.
    }
  }

  // Fallback 2: Try to get from attachments
  if (!displayThumbnailUrl && post.attachments && post.attachments.length > 0) {
    const firstPublicImageAttachment = post.attachments.find(
      (att) => att.publicYn === "Y" && att.mimeType.startsWith("image/")
    );
    if (firstPublicImageAttachment) {
      displayThumbnailUrl = getPublicFileDownloadUrl(
        firstPublicImageAttachment.fileId
      );
    }
  }

  // Content snippet for Post:
  // If post.content is HTML, this getTextFromLexicalContent will likely not work as intended.
  // If post.content is consistently Lexical JSON, this is fine.
  // Otherwise, a different snippet generation strategy is needed for HTML content.
  let snippet = null;
  if (post.content) {
    // Check if content exists
    try {
      const rawContentText = getTextFromLexicalContent(post.content);
      if (rawContentText) {
        // Check if text was actually extracted
        snippet =
          rawContentText.substring(0, 100) +
          (rawContentText.length > 100 ? "..." : "");
      }
    } catch (error) {
      // console.warn("Could not parse post.content as JSON for snippet for post:", post.nttId, error);
      // If it's HTML, we might need a simple text stripper or leave snippet null.
    }
  }

  return {
    id: post.nttId,
    title: post.title,
    thumbnailUrl: displayThumbnailUrl,
    writer: post.writer,
    displayWriter: post.displayWriter,
    createdAt: post.createdAt,
    postedAt: post.postedAt,
    hits: post.hits,
    detailUrl: `${currentPathId}/read/${post.nttId}`,
    hasImageInContent: post.hasImageInContent,
    hasAttachment: post.hasAttachment,
    contentSnippet: snippet,
    externalLink: post.externalLink || null,
    categories: post.categories,
  };
}

export function mapArticleToCommonCardData(
  article: BoardArticleCommon,
  menuPath: string
): CommonCardData {
  let displayThumbnailUrl: string | null = null;

  if (article.thumbnailUrl) {
    displayThumbnailUrl = article.thumbnailUrl;
  } else {
    const firstImageSrc = getFirstImageSrcFromContent(article.content);
    if (firstImageSrc) {
      displayThumbnailUrl = firstImageSrc;
    } else if (article.attachments && article.attachments.length > 0) {
      const firstFile = article.attachments[0];
      if (
        firstFile &&
        firstFile.mimeType &&
        firstFile.mimeType.startsWith("image/")
      ) {
        // Ensure getPublicFileDownloadUrl is correctly imported and used
        displayThumbnailUrl = getPublicFileDownloadUrl(firstFile.fileId);
      }
    }
  }

  const rawContentText = getTextFromLexicalContent(article.content);
  const snippet =
    rawContentText.substring(0, 100) +
    (rawContentText.length > 100 ? "..." : "");

  return {
    id: article.nttId,
    title: article.title,
    thumbnailUrl: displayThumbnailUrl,
    writer: article.writer,
    displayWriter: article.displayWriter,
    postedAt: article.postedAt,
    createdAt: article.createdAt,
    hits: article.hits,
    detailUrl: `${menuPath}/read/${article.nttId}`, // Verify this path structure
    hasImageInContent: article.hasImageInContent,
    hasAttachment: article.hasAttachment,
    contentSnippet: snippet,
    externalLink: article.externalLink || null,
    categories: (article as any).categories,
  };
}

// Placeholder for the next mapping function
// import { Article } from "@/lib/api/article"; // Will need this
// export function mapArticleToCommonCardData(article: Article, basePath: string): CommonCardData {
//   // ... implementation to follow
//   return {} as CommonCardData; // Placeholder
// }
