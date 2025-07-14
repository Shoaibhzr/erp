import { UserRoleModel } from "./user-role-model";

export class UserModel {
  public id: string;
  public businessName: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public isEmailVerified: boolean;
  public phone: string;
  public password:string;
  public isPhoneVerified: boolean;
  public profilePictureWebUrl: string;
  public avgRating: number;
  public userRoles: UserRoleModel[];
  public subsidiaries: any[];
  public createdBy: string;
  public createdOn: Date;
  public updatedBy: string;
  public updatedOn: string;
  public isDeleted: boolean;
}

export class ChangePasswordModel {
  public currentPassword: string;
  public newPassword: string;
  public updatePasswordType: string;
}

export interface VendorSubsidiary {
  id: string;
  name: string;
}