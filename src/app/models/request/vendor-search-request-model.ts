export class VendorSearchRequestModel {
  public ids: string[];
  public keyword: string;
  public excludeIds:string[];
  public page: number;
  public pageSize: number;
  public userTypeSearch: string;
}
