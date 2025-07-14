export enum SearchType {
  repairAndMainenance = 'RepairAndMaintenance',
  expense = 'Expense',
  accountsPayable = 'AccountsPayable',
}

export interface SearchRequest {
  page: number;
  pageSize: number;
  type?: SearchType;
  keyword?: string;
  status?: string[];
}

export interface SearchResponse<T> {
  currentPageIndex: number;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onFirstPage: boolean;
  onLastPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: T[];
}

export type Url = 'servicerequest' | 'vendor' | 'category';
