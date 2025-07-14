import { FileModel } from "../file-model";
import { QuotationStatus } from "../quotation-status";
import { QuotationCreateRequestModel } from "./quotation-create-request-model";

export class QuotationUpdateRequestModel extends QuotationCreateRequestModel {
  public id: string;
}
