export enum RegistrationStep {
  none,
  cellNumberEntry,
  codeVerification,
  companyDetail,
  profileCompletion
}

export enum ExceptionName {
  argumentNullException = "ArgumentNullException",
  invalidOperationException = "InvalidOperationException",
  otpExpiredException = "OtpExpiredException",
  notFoundException = "NotFoundException",
  alreadyExistsException = "AlreadyExistsException",
  companyVerificationFailedException ="CompanyVerificationFailedException",
  emailAlreadyExists = "EmailAlreadyExistsException",
  phoneAlreadyExists = "PhoneAlreadyExistsException",
  currentPasswordMismatch = "PasswordMismatchException",
  otpNotFound = 'OtpNotFoundException',
  otpExpired = 'OtpExpiredException',
  userNotFound = 'UserNotFoundException',
  approvalProcessAlreadyExists = 'ApprovalProcessAlreadyExistsException'
}

export class Exception {
  public status: number;
  public title: string;
  public message: string;

  public static getUnavailableException() {

    let unavailableException = new Exception();
    unavailableException.status = 503;
    unavailableException.title = 'Service Unavailable';
    unavailableException.message = 'Service Unavailable';
    return unavailableException;

  }
}

export enum StorageKey {
  jwt = "Jwt",
  refreshToken = "RefreshToken"
}

export enum SidebarMenuItem {
  none,
  users,
  companies,
  dealerships,
  conversations,
  trainings,
  dashboards
}

export const TOAST_TIMEOUT = 10000; // 10 seconds
