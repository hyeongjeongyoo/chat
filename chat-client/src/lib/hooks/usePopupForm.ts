"use client";

import { useState, useCallback } from "react";
import { popupApi } from "@/lib/api/popup";
import { Popup } from "@/types/api";

export function usePopupForm(initialData?: Partial<Popup> | null) {
  const [formData, setFormData] = useState<Partial<Popup>>({
    id: initialData?.id,
    title: initialData?.title || "",
    content: initialData?.content || "",
    startDate:
      initialData?.startDate?.substring(0, 16) ||
      new Date().toISOString().substring(0, 16),
    endDate:
      initialData?.endDate?.substring(0, 16) ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 16),
    visible: initialData?.visible ?? true,
    displayOrder: initialData?.displayOrder || 0,
  });

  const [pendingMedia, setPendingMedia] = useState<Map<string, File>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormField = useCallback((field: keyof Popup, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateContent = useCallback((newContent: string) => {
    setFormData((prev) => ({ ...prev, content: newContent }));
  }, []);

  const handleMediaAdded = useCallback((localUrl: string, file: File) => {
    setPendingMedia((prev) => new Map(prev).set(localUrl, file));
  }, []);

  const clearPendingMedia = useCallback(() => {
    setPendingMedia(new Map());
  }, []);

  const handleSubmit = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();

    // The content field should not be part of the main `popupData` DTO,
    // as it contains temporary blob URLs. It's sent separately via 'editorContentJson'.
    const { content, ...restOfFormData } = formData;

    const apiData: Partial<Popup> & { isVisible?: boolean } = {
      ...restOfFormData,
      isVisible: !!formData.visible,
    };
    delete apiData.visible;

    // When updating, do not send the displayOrder value.
    // It should only be updated via drag-and-drop in the list view.
    if (apiData.id) {
      delete apiData.displayOrder;
    }

    formDataToSend.append(
      "popupData",
      new Blob([JSON.stringify(apiData)], {
        type: "application/json",
      })
    );

    // Send the content separately as required by the backend API.
    formDataToSend.append("content", formData.content || "");

    const mediaLocalIds: string[] = [];
    for (const [localUrl, file] of pendingMedia.entries()) {
      formDataToSend.append("mediaFiles", file, file.name);
      mediaLocalIds.push(localUrl);
    }

    // Correctly append each local ID as a separate part
    if (mediaLocalIds.length > 0) {
      mediaLocalIds.forEach(id => {
        formDataToSend.append('mediaLocalIds', id);
      });
    }

    try {
      let response;
      if (formData.id) {
        response = await popupApi.updatePopup(formData.id, formDataToSend);
      } else {
        response = await popupApi.createPopup(formDataToSend);
      }

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || "An unknown error occurred.");
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateFormField,
    updateContent,
    isLoading,
    error,
    handleSubmit,
    handleMediaAdded,
    clearPendingMedia,
  };
} 