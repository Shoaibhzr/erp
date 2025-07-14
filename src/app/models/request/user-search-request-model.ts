export class UserSearchRequestModel {
  public ids: string[];
  public roleIds: string[];
  public keyword: string;
  public page: number;
  public pageSize: number;
  public companyIds: string[];
  public userTypeSearch: string;
}
