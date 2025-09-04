import { Template } from "@/types/api";

export interface DragItem {
  id: number;
  type: string;
  parentId?: number;
  index: number;
  level: number;
}

export interface TemplateItemProps {
  template: Template;
  level: number;
  onEditTemplate: (template: Template) => void;
  expanded: boolean;
  onToggle: () => void;
  onDeleteTemplate: (templateId: number) => void;
  index: number;
  selectedTemplateId?: number;
  refreshTemplates: () => Promise<void>;
}

export interface TemplateListProps {
  templates: Template[];
  onEditTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: number) => void;
  isLoading: boolean;
  selectedTemplateId?: number;
  loadingTemplateId?: number | null;
}

export interface TemplateItem {
  id: number;
  name: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  children?: TemplateItem[];
  level: number;
}
