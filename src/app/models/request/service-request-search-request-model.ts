import { ServiceRequestStatus } from "../service-request-status";
import { ServiceRequestType } from "../service-request-type";

export class ServiceRequestSearchRequestModel {
  public type: ServiceRequestType;
  public page: number;
  public pageSize: number;
  public ids: string[];
  public companyIds: string[];
  public keyword: string;
  public storeIds: string[];
  public status: ServiceRequestStatus[]
  public createdBy: string[];
  public myPendingApproval: boolean;

}
