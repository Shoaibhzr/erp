import { FileModel } from "../file-model";
import { QuotationStatus } from "../quotation-status";
import { PaymentCreateRequestModel } from "./payment-create-request-model";

export class PaymentUpdateRequestModel extends PaymentCreateRequestModel {
  public id: string;
}
