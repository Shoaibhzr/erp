import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Models */
import { ChangePasswordModel, UserModel } from '../models/user-model';
import { AuthenticateRequestModel } from '../models/request/authenticate-request-model';
import { AuthenticateResponseModel } from '../models/response/authenticate-response-model';

/** Environment */
import { environment } from '../../environments/environment';
import { UserSearchRequestModel } from '../models/request/user-search-request-model';
import { PagedList } from '../models/common/paged-list';
import { UriResponse } from '../models/common/uri-response';
import { UserCreateRequestModel } from '../models/request/user-create-request-model';
import { UserUpdateRequestModel } from '../models/request/user-update-request-model';
import { PasswordChangeOTPRequestModel } from '../models/request/password-change-otp.model';
import { RoleModel } from '../models/role-model';
import { StoreRoleModel } from '../models/store-role-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/user`;

  constructor(private http: HttpClient) {
  }

  public getMyPendingActionAsync(): Observable<any> {
    return this.http.get<any>(`${this.ctrlUrl}/my/pending/action`);
  }

  public authenticateAsync(authenticateRequestModel: AuthenticateRequestModel): Observable<AuthenticateResponseModel> {
    return this.http.post<AuthenticateResponseModel>(`${this.ctrlUrl}/authenticate`, authenticateRequestModel);
  }

  public getMyAsync(): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.ctrlUrl}/my`);
  }

  public deleteUserAsync(user:any) {
    return this.http.delete(`${this.ctrlUrl}/DeleteUserAsync/${user}`);
  }

  public searchAsync(userSearchRequestModel: UserSearchRequestModel): Observable<PagedList<UserModel>> {
    return this.http.post<PagedList<UserModel>>(`${this.ctrlUrl}/search`, userSearchRequestModel);
  }

  public uploadProfilePictureAsync(formData: FormData): Observable<UriResponse> {
    return this.http.post<UriResponse>(`${this.ctrlUrl}/upload/profile-picture`, formData);
  }

  public createAsync(userCreateRequestModel: UserCreateRequestModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.ctrlUrl}`, userCreateRequestModel);
  }

  public updateAsync(userUpdateRequestModel: UserUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, userUpdateRequestModel);
  }

  public changePasswordAsync(changePasswordModel: ChangePasswordModel): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/password/update`, changePasswordModel);
  }

  public getChangeEmailOTP(newEmail: string): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/email/update`, { newEmail });
  }

  public VerifyChangeEmailOTP(otp: string): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/email/update/verify`, { otp });
  }

  public getChangePasswordOTP(email: string): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/password/reset`, { email });
  }

  public VerifyChangePasswordOTP(passwordChangeOTPRequest: PasswordChangeOTPRequestModel): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/password/reset/verify`, passwordChangeOTPRequest);
  }

  public checkDuplicateRole(companyRoleid: any): Observable<any> {
    return this.http.post<any>(`${this.ctrlUrl}/check/companyrole`, companyRoleid);
  }

  public checkStoreRole(storeRoleModel: StoreRoleModel): Observable<any> {
    return this.http.post<any>(`${this.ctrlUrl}/check/storerole`, storeRoleModel);
  }

  public getCompanyRolesAsync(storeId:any): Observable<any> {
    return this.http.get<void>(`${this.ctrlUrl}/search/companyroles/${storeId}`);
  }

  

}
