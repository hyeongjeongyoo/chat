import {
  Template,
  TemplateData,
  TemplateVersion,
  TemplateListResponse,
} from "@/types/api";
import { privateApi } from "./client";

export const templateKeys = {
  all: ["template"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (filters: string) => [...templateKeys.lists(), { filters }] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

export const templateApi = {
  getTemplates: (type?: string) => {
    return privateApi.get<TemplateListResponse>(
      type ? `/cms/template?type=${type}` : "/cms/template"
    );
  },

  getTemplate: (id: string) => {
    return privateApi.get<Template>(`/cms/template/${id}`);
  },

  createTemplate: (data: TemplateData) => {
    return privateApi.post<Template>("/cms/template", data);
  },

  updateTemplate: (id: string, data: TemplateData) => {
    return privateApi.put<Template>(`/cms/template/${id}`, data);
  },

  deleteTemplate: (id: string) => {
    return privateApi.delete<void>(`/cms/template/${id}`);
  },

  togglePublish: (id: string, published: boolean) => {
    return privateApi.patch<Template>(`/cms/template/${id}/publish`, {
      published,
    });
  },

  getVersions: (id: string) => {
    return privateApi.get<TemplateVersion[]>(`/cms/template/${id}/versions`);
  },

  rollbackVersion: (id: string, versionNo: number) => {
    return privateApi.post<Template>(`/cms/template/${id}/rollback`, {
      versionNo,
    });
  },

  preview: (data: TemplateData) => {
    return privateApi.post<Template>("/cms/template/preview", data);
  },
};
