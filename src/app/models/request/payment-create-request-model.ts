import { FileModel } from "../file-model";
import { PaymentItemModel } from "../payment-item-model";
import { PaymentStatus } from "../payment-status";

export class PaymentCreateRequestModel {
  public serviceRequestId: string;
  public description: string;
  public items: PaymentItemModel[];
  public files: FileModel[];
}
