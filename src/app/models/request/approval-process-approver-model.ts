import { ApproverType } from "../approver-type";
import { CategoryMinimalModel } from "../category-minimal-model";
import { ServiceRequestType } from "../service-request-type";
import { UserApprovalModel } from "../user-approval-model";
import { UserMinimalModel } from "../user-minimal-model";
import { UserRoleModel } from "../user-role-model";

export class ApprovalProcessApproverModel {
  public id: string;
  public type: ApproverType;
  public userId: string;
  public groupId: string;
  public roleId: string;
  public name: string;
  public description: string;
  public order: number;
}


export class ApprovalProcessCreateRMRequestModel {
  public id: string;
  public companyId: string;
  public storeId: string;
  public storeGroupId: string;
  public name: string;
  public description: string;
  public serviceRequestType: ServiceRequestType;
  public categoryCreateApproval: CategoryCreateApprovalModel[];
}

export class CategoryCreateApprovalModel {
  public categoryId: string;
  public userRoleId: string[];
}
export class CategoryDetailApprovalModel {
  public category: CategoryMinimalModel;
  public userRoleId: UserApprovalModel[];
}

// export class ApprovalProcessRMUpdateRequestModel extends ApprovalProcessCreateRMRequestModel {
//   public id: string;
// }




