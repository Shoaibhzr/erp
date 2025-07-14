import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';

/** Models */


/** Environment */
import { environment } from '../../environments/environment';
import { RepairAndMaintenanceCategoryModel } from '../models/repair-and-maintenance-category-model';
import { ApprovalProcessCreateRMRequestModel } from '../models/request/approval-process-approver-model';
import { CheckStoreCategoryModel } from '../models/check-store-category-model';
import { ApprovalProcessSearchRequestModel } from '../models/request/approval-process-search-request-model';
import { SearchResponse } from '../models/search';

@Injectable({
  providedIn: 'root'
})
export class RepairAndMaintenanceCategoryService {

  private searchIsLoading = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.searchIsLoading.asObservable();

  private ctrlUrl: string = `${environment.apiUrl}/v1/RepairAndMaintenanceCategory`;

  constructor(private http: HttpClient) {
  }

  public getAsync(): Observable<RepairAndMaintenanceCategoryModel[]> {

    return this.http.get<RepairAndMaintenanceCategoryModel[]>(`${this.ctrlUrl}`);

  }

  public searchApprovalProcessAsync<T>(
    payload: ApprovalProcessSearchRequestModel
  ): Observable<SearchResponse<T>> {
    this.searchIsLoading.next(true);

    return this.http
      .post<SearchResponse<T>>(
        `${this.ctrlUrl}/search/allapprovals`,
        payload
      )
      .pipe(
        catchError((error) => {
          console.error('Search Error:', error);
          return of(null);
        }),
        finalize(() => {
          this.searchIsLoading.next(false);
        })
      );
  }

  public searchApprovalEditAsync<T>(
    payload: ApprovalProcessSearchRequestModel
  ): Observable<SearchResponse<T>> {
    this.searchIsLoading.next(true);

    return this.http
      .post<SearchResponse<T>>(
        `${this.ctrlUrl}/search/approvals`,
        payload
      )
      .pipe(
        catchError((error) => {
          console.error('Search Error:', error);
          return of(null);
        }),
        finalize(() => {
          this.searchIsLoading.next(false);
        })
      );
  }


  public createApprovalProcessAsync(approvalProcessCreateRequestModel: ApprovalProcessCreateRMRequestModel): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/approvals`, approvalProcessCreateRequestModel);
  }

  public updateApprovalProcessAsync(approvalProcessUpdateRequestModel: ApprovalProcessCreateRMRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}/approvals`, approvalProcessUpdateRequestModel);
  }

  public checckStoreCategoryAsync(checckStoreCategoryModel: CheckStoreCategoryModel): Observable<void> {
    return this.http.post<void>(`${this.ctrlUrl}/check/storecategory`, checckStoreCategoryModel);
  }

  public deleteApprovalAsync(storeID: any, categoryId: any) {
    return this.http.delete(`${this.ctrlUrl}/approvals/${storeID}/${categoryId}`);
  }

}
