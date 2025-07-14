export class PagedList<T> {
  public currentPageIndex: number;
  public currentPage: number;
  public pageSize: number;
  public totalRecords: number;
  public totalPages: number;
  public onFirstPage: boolean;
  public onLastPage: boolean;
  public hasNextPage: boolean;
  public hasPreviousPage: boolean;
  public items: T[];
}
