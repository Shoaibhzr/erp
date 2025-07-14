import { FileModel } from "./file-model";
import { InvoiceFileModel } from "./invoice-file-model";
import { InvoiceItemModel } from "./invoice-item-model";
import { InvoiceStatus } from "./invoice-status";
import { QuotationFileModel } from "./quotation-file-model";
import { QuotationItemModel } from "./quotation-item-model";
import { QuotationStatus } from "./quotation-status";
import { UserMinimalModel } from "./user-minimal-model";

export class InvoiceModel {
  public id: string;
  public status: InvoiceStatus;
  public files: InvoiceFileModel[];
  public subTotal: number;
  public tax: number;
  public total: number;
  public items: InvoiceItemModel[];
  public createdBy: UserMinimalModel;
  public createdOn: Date;
  public description: string;
}
