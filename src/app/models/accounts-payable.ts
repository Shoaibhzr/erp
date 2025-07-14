import { ServiceRequestStatus } from './service-request-status';

export enum AmountAllocatedOptions {
  equally = 'Equally',
  manually = 'Manually',
}

export enum AllocateByOptions {
  percentage = 'Percentage',
  amount = 'Amount',
}
export interface AccountsPayable {
  id: string;
  type: string;
  company: Company;
  number: number;
  title: string;
  description: string;
  priority: string;
  dueOn: Date;
  status: ServiceRequestStatus;
  vendorId: string;
  vendor: APVendor;
  accountsPayableDetails: AccountsPayableDetails;
  category: APCategory;
  files: File[];
  approvals: any[];
  createdBy: AtedBy;
  createdOn: Date;
  updatedBy: AtedBy;
  updatedOn: Date;
  isDeleted: boolean;
}

export interface AccountsPayableDetails {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceAmount: number;
  remainingAmount: number;
}

export interface APCategory {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string;
}

export interface AtedBy {
  id: string;
  firstName: string;
  lastName: string;
}

export interface File {
  name: string;
  webUrl: string;
  contentType: string;
  size: number;
}

export interface APVendor {
  id: string;
  firstName: string;
}

export interface AccountsPayableWriteModel {
  id?: string;
  AccountPayableDetailId?: string;
  companyId: string;
  vendorId: string;
  vendorSubsidiary: string;
  memo: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  invoiceAmount: number;
  hasTax: boolean;
  isUrgent: boolean;
  categoryId: string;
  files: File[];
  accountsPayableItems: AccountsPayableItem[];
}

export interface AccountsPayableItem {
  id?: string;
  chartOfAccountId: string;
  storeGroupId: string;
  storeId: string;
  description: string;
  amount: number;
}

export interface CoaCategory {
  id: string;
  name: string;
  createdById: string;
  createdOn: Date;
  updatedById: string;
  updatedOn: Date;
  isDeleted: boolean;
}

export interface VendorSubsidiary {
  id: string;
  name: string;
}

export interface AccountsPayableReadModel {
  id: string;
  number: number;
  vendor: Vendor;
  vendorSubsidiary: VendorSubsidiary;
  accountsPayableDetails: AccountsPayableDetails;
  category: Category;
  memo: string;
  invoiceDate: Date;
  dueDate: Date;
  invoiceAmount: number;
  hasTax: boolean;
  isUrgent: boolean;
  files: File[];
  status: ServiceRequestStatus;
  items: AccountsPayableReadModelItem[];
  comments: any[];
  createdOn: Date;
  updatedOn: Date;
  isDeleted: boolean;
  approvals: Approval[];
  reason: string;
  isNSSubmitted: boolean;
}

export interface Approval {
  approver: Approver;
  role: Role;
  state: string;
}

export interface Approver {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureWebUrl: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface AccountsPayableReadModelItem {
  id: string;
  serviceRequestId: string;
  chartOfAccount: ChartOfAccount;
  store: VendorSubsidiary;
  storeGroup: ChartOfAccount;
  description: string;
  amount: number;
  createdOn: Date;
  updatedOn: Date;
  isDeleted: boolean;
}

export interface ChartOfAccount {
  name: string;
  id: string;
  isDeleted: boolean;
}

export interface VendorSubsidiary {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  firstName: string;
}
export interface Category {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  storeGroupId: string;
}
