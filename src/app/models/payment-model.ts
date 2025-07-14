import { FileModel } from "./file-model";
import { InvoiceFileModel } from "./invoice-file-model";
import { InvoiceItemModel } from "./invoice-item-model";
import { InvoiceStatus } from "./invoice-status";
import { PaymentItemModel } from "./payment-item-model";
import { PaymentStatus } from "./payment-status";
import { QuotationFileModel } from "./quotation-file-model";
import { QuotationItemModel } from "./quotation-item-model";
import { QuotationStatus } from "./quotation-status";
import { UserMinimalModel } from "./user-minimal-model";

export class PaymentModel {
  public id: string;
  public status: PaymentStatus;
  public description: string;
  public files: FileModel[];
  public total: number;
  public remaining: number;
  public paid: number;
  public items: PaymentItemModel[];
}
