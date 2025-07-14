import { FileModel } from "../file-model";
import { PaymentMethod } from "../payment-method";

export class PaymentItemCreateRequestModel {
  public paymentId: string;
  public paymentMethod: PaymentMethod;
  public paymentDate: Date;
  public paidBy: string;
  public description: string;
  public paymentAmount: string;
  public referenceNumber: string;
  public chequeNumber: string;
  public chequeCashedDate: Date;
  public cardNumber: string;
  public files: FileModel[];
}
