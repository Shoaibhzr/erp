import { CompanyMinimalModel } from "./company-minimal-model";
import { GroupMinimalModel } from "./group-minimal-model";
import { StoreGroupMinimalModel } from "./store-group-minimal-model";
import { StoreMinimalModel } from "./store-minimal-model";

export class UserRoleModel {
  public id: string;
  public company: CompanyMinimalModel;
  public store: StoreMinimalModel;
  public group: GroupMinimalModel;
  public roleId: string;
  public userId: string;
  public createdBy: string;
  public createdOn: Date;
  public updatedBy: string;
  public updatedOn: string;
  public isDeleted: boolean;
}
