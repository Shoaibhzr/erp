export interface Vendor {
  firstName: string;
  email: string;
  isEmailVerified: boolean;
  phone?: string;
  isPhoneVerified?: boolean;
  avgRating?: number;
  userRoles: UserRole[];
  id: string;
  createdById: string;
  createdOn: Date;
  updatedById: string;
  updatedOn: Date;
  isDeleted: boolean;
  lastName?: string;
  profilePictureWebUrl?: string;
}

export interface UserRole {
  roleId: string;
}
