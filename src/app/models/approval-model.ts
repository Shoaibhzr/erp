import { ApprovalState } from "./approval-state";
import { RoleModel } from "./role-model";
import { UserMinimalModel } from "./user-minimal-model";

export class ApprovalModel {
  public approver: UserMinimalModel;
  public state: ApprovalState;
  public reason: string;
  public role: RoleModel;
  public updatedOn: Date;
}
