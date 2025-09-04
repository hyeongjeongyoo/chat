export interface Company {
  companyId?: number;
  companyName: string;
  tagline?: string;
  residentYear: number;
  logoFileId?: number;
  homepageUrl?: string;
  summaryHtml?: string;
  ceoName?: string;
  foundedDate?: string;
  industry?: string;
  location?: string;
  displayYn: boolean;
  sortOrder?: number;
  extra?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  size: number;
}
