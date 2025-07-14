import { JwtModel } from "../jwt-model";
import { UserModel } from "../user-model";

export class AuthenticateResponseModel {
  public jwt: JwtModel;
  public user: UserModel;
}
