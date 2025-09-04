/**
 * Generates the public download URL for a given file ID.
 * @param fileId The ID of the file.
 * @returns The public URL string for downloading the file.
 */
export const getPublicFileDownloadUrl = (fileId: number): string => {
  if (typeof fileId !== "number" || fileId <= 0) {
    console.warn(
      "Invalid fileId provided to getPublicFileDownloadUrl:",
      fileId
    );
    return "#";
  }
  // Use an environment variable for the API base URL, defaulting if not set.
  // IMPORTANT: Ensure this base URL is correct for your file download endpoint.
  // It might be different from the main API_V1_URL.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL + "/api/v1";
  return `${apiBaseUrl}/cms/file/public/download/${fileId}`; // 파일 다운로드 URL
};
