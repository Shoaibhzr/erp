import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Models */
import { StoreGroupModel, StoreModel } from '../models/store-model';
import { CompanyModel } from '../models/company-model';
import { PagedList } from '../models/common/paged-list';
import { UriResponse } from '../models/common/uri-response';
import { ApprovalProcessModel } from '../models/approval-process-model';
import { StoreSearchRequestModel } from '../models/request/store-search-request-model';
import { StoreCreateRequestModel } from '../models/request/store-create-request-model';
import { StoreUpdateRequestModel } from '../models/request/store-update-request-model';
import { ApprovalProcessCreateRequestModel } from '../models/request/approval-process-create-request-model';
import { ApprovalProcessUpdateRequestModel } from '../models/request/approval-process-update-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { ApprovalProcessSearchRequestModel } from '../models/request/approval-process-search-request-model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/store`;

  constructor(private http: HttpClient) {
  }

  public createAsync(storeCreateRequestModel: StoreCreateRequestModel): Observable<StoreModel> {
    return this.http.post<StoreModel>(`${this.ctrlUrl}`, storeCreateRequestModel);
  }

  public updateAsync(storeUpdateRequestModel: StoreUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, storeUpdateRequestModel);
  }

  public searchAsync(storeSearchRequestModel: StoreSearchRequestModel): Observable<PagedList<StoreModel>> {
    return this.http.post<PagedList<StoreModel>>(`${this.ctrlUrl}/search`, storeSearchRequestModel);
  }

  public createApprovalProcessAsync(approvalProcessCreateRequestModel: ApprovalProcessCreateRequestModel): Observable<ApprovalProcessModel> {
    return this.http.post<ApprovalProcessModel>(`${this.ctrlUrl}/approval-process`, approvalProcessCreateRequestModel);
  }

  public updateApprovalProcessAsync(approvalProcessUpdateRequestModel: ApprovalProcessUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}/approval-process`, approvalProcessUpdateRequestModel);
  }

  public searchApprovalProcessAsync(approvalProcessSearchRequestModel: ApprovalProcessSearchRequestModel): Observable<PagedList<ApprovalProcessModel>> {
    return this.http.post<PagedList<ApprovalProcessModel>>(`${this.ctrlUrl}/approval-process/search`, approvalProcessSearchRequestModel);
  }

  public getStoreGroups(companyId:any) {
    return this.http.get(`${this.ctrlUrl}/storegroup/company/${companyId}`);
  }

  public getStores(storeGroupId:any) {
    return this.http.get(`${this.ctrlUrl}/storegroup/store/${storeGroupId}`);
  }

  public getStoresBulk(form:any) {
    return this.http.post(`${this.ctrlUrl}/storegroup/store`,form);
  }

  public createStoreGroupAsync(form:any) {
    return this.http.post(`${this.ctrlUrl}/storegroup`,form);
  }

  public searchStoreGroupsAsync(storeGroupSearchRequestModel: any): Observable<PagedList<StoreGroupModel>> {
    return this.http.post<PagedList<StoreGroupModel>>(`${this.ctrlUrl}/search/storegroup`, storeGroupSearchRequestModel);
  }

  public updateStoreGroupAsync(form:any) {
    return this.http.put(`${this.ctrlUrl}/storegroup`,form);
  }

  public deleteStoreGroupAsync(storeGroupId:any) {
    return this.http.delete(`${this.ctrlUrl}/storegroup/${storeGroupId}`);
  }

  public checkStoreAsync(storeId:any) {
    return this.http.get(`${this.ctrlUrl}/storegroup/checkstore/${storeId}`);
  }

  public getStoresOnCompanyId(searchParameter:any) {
    return this.http.post(`${this.ctrlUrl}/search`,searchParameter);
  }

  public deleteStoreAsync(storeId:any) {
    return this.http.delete(`${this.ctrlUrl}/${storeId}`);
  }

}
