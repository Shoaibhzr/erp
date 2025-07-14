import { FileModel } from "../file-model";
import { QuotationStatus } from "../quotation-status";

export class QuotationCreateRequestModel {
  public serviceRequestId: string;
  public vendorId: string;
  public status: QuotationStatus;
  public files: FileModel[];
}
