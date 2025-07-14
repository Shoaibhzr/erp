import { FileModel } from "./file-model";
import { QuotationFileModel } from "./quotation-file-model";
import { QuotationItemModel } from "./quotation-item-model";
import { QuotationStatus } from "./quotation-status";
import { UserMinimalModel } from "./user-minimal-model";

export class QuotationModel {
  public id: string;
  public vendor: UserMinimalModel;
  public description: string;
  public status: QuotationStatus;
  public files: QuotationFileModel[];
  public subTotal: number;
  public tax: number;
  public total: number;
  public createdOn: Date;
  public items: QuotationItemModel[];
}
