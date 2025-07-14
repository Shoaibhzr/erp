import { ExceptionName } from "../models/common";

export class ExceptionHandler {
    static getExceptionMessage(error: any) {
        const errorTitle = error?.error?.title
        if (errorTitle === ExceptionName.otpNotFound) {
            return 'Wrong OTP. Please try again!';
        }
        if (errorTitle === ExceptionName.otpExpired) {
            return 'Expired OTP. Please try again!';
        }
        if (errorTitle === ExceptionName.userNotFound) {
            return 'The user does not exist. Please verify the email!';
        }
        if (errorTitle === ExceptionName.userNotFound) {
            return 'The user does not exist. Please verify the email!';
        }
        if (errorTitle === ExceptionName.approvalProcessAlreadyExists) {
            return 'Approval process already exists';
        }
        return null;
    }
}