import { FileModel } from "./file-model";
import { QuotationStatus } from "./quotation-status";
import { UserMinimalModel } from "./user-minimal-model";

export class QuotationItemModel {
  public id: string;
  public chartOfAccountId: string;
  public name: string;
  public description: string;
  public amount: number;
  public status: QuotationStatus;
  public files: FileModel[];
}
