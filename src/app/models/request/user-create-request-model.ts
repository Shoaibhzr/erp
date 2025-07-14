import { FileModel } from "../file-model";
import { QuotationStatus } from "../quotation-status";

export class UserCreateRequestModel {
  public firstName: string;
  public lastName: string;
  public email: string;
  public phone: string;
  public password: string;
  public profilePictureWebUrl: string;
  public roleId: string;
  public companyId: string;
  public storeId: string;
}
