import { ApprovalState } from "./approval-state";
import { CategoryMinimalModel } from "./category-minimal-model";
import { CompanyMinimalModel } from "./company-minimal-model";
import { ApprovalProcessApproverModel, CategoryCreateApprovalModel, CategoryDetailApprovalModel } from "./request/approval-process-approver-model";
import { ServiceRequestType } from "./service-request-type";
import { StoreGroupMinimalModel } from "./store-group-minimal-model";
import { StoreMinimalModel } from "./store-minimal-model";
import { UserMinimalModel } from "./user-minimal-model";

export class ApprovalProcessModel {
  public id: string;
  public category: CategoryMinimalModel;
  public company: CompanyMinimalModel;
  public store: StoreMinimalModel;
  public name: string;
  public description: string;
  public approvers: ApprovalProcessApproverModel[];
  public serviceRequestType: ServiceRequestType;
  public createdOn: Date;
}
export class ApprovalProcessWithCategoriesModel {
  public id: string;
  public categories: any[];
  public category: string;
  public company: string;
  public store: string;
  public storeId: string;
  public storeGroupId: string;
  public companyId: string;
  public categoryId: string;
  public storeGroup: string;
  public name: string;
  public description: string;
  public categoryApprovalObj: CategoryDetailApprovalModel[];
  public serviceRequestType: ServiceRequestType;
  public createdOn: Date;
}
