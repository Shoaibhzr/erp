import { FileModel } from "./file-model";
import { InvoiceStatus } from "./invoice-status";
import { PaymentMethod } from "./payment-method";
import { QuotationStatus } from "./quotation-status";
import { UserMinimalModel } from "./user-minimal-model";

export class PaymentItemModel {
  public id: string;
  public paymentMethod: PaymentMethod;
  public paymentDate: Date;
  public paidBy: string;
  public description: string;
  public paymentAmount: number;
  public referenceNumber: string
  public chequeNumber: string
  public chequeCashedDate: Date;
  public cardNumber: string;
  public files: FileModel[];
}
