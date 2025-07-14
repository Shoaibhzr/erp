import { FileModel } from "./file-model";
import { InvoiceStatus } from "./invoice-status";
import { QuotationStatus } from "./quotation-status";
import { StoreGroupModel, StoreModel } from "./store-model";
import { UserMinimalModel } from "./user-minimal-model";

export class InvoiceItemModel {
  public id: string;
  public chartOfAccountId: string;
  public name: string;
  public description: string;
  public invoiceNumber: string;
  public invoiceDate: Date;
  public companyId: string;
  public storeIds: string[];
  public stores: StoreModel[];
  public groups: StoreGroupModel[];
  public isPaid: boolean;
  public expenseCategoryId: string;
  public amount: number;
  public status: InvoiceStatus;
  public files: FileModel[];
}
