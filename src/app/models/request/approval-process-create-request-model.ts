import { ServiceRequestType } from "../service-request-type";
import { ApprovalProcessApproverModel } from "./approval-process-approver-model";

export class ApprovalProcessCreateRequestModel {
  public companyId: string;
  public storeId: string;
  public name: string;
  public description: string;
  public serviceRequestType: ServiceRequestType;
  public approvers: ApprovalProcessApproverModel[];
}
