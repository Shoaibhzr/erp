import { ServiceRequestType } from "../service-request-type";
import { ApprovalProcessCreateRequestModel } from "./approval-process-create-request-model";

export class ApprovalProcessSearchRequestModel {
  public ids: string[];
  public companyIds: string[];
  public storeIds: string[];
  public keyword: string;
  public page: number;
  public pageSize: number;
  public type: ServiceRequestType;
}
