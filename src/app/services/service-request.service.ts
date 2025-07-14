import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, of, tap } from 'rxjs';

/** Models */
import { StoreModel } from '../models/store-model';
import { CompanyModel } from '../models/company-model';
import { PagedList } from '../models/common/paged-list';
import { UriResponse } from '../models/common/uri-response';
import { UploadLogoRequestModel } from '../models/request/upload-logo-request-model';
import { StoreSearchRequestModel } from '../models/request/store-search-request-model';
import { CompanyCreateRequestModel } from '../models/request/company-create-request-model';
import { CompanyUpdateRequestModel } from '../models/request/company-update-request-model';
import { ServiceRequestSearchRequestModel } from '../models/request/service-request-search-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { ServiceRequestModel } from '../models/service-request-model';
import { ToasterService } from '../utils/toaster.service';
import { SearchRequest, SearchResponse, Url } from '../models/search';

@Injectable({
  providedIn: 'root',
})
export class ServiceRequestService {
  private searchIsLoading = new BehaviorSubject<boolean>(false);
    isLoading$: Observable<boolean> = this.searchIsLoading.asObservable();
  private ctrlUrl: string = `${environment.apiUrl}/v1/servicerequest`;

  constructor(private http: HttpClient, private toasterSvc: ToasterService) {}

  public getByIdAsync(id: string): Observable<ServiceRequestModel> {
    return this.http.get<ServiceRequestModel>(
      `${environment.apiUrl}/v1/servicerequest/${id}`
    );
  }

  public getPdfByIdAsync(id: string): Observable<any> {
    return this.http.get(`${this.ctrlUrl}/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  public approveAsync(id: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/${id}`, undefined);
  }

  public rejectAsync(id: string, reason: string): Observable<void> {
    let url = `${this.ctrlUrl}/reject/${id}`;

    if (reason) {
      url += `?reason=${reason}`;
    }

    return this.http.patch<void>(url, undefined);
  }

  public returnAsync(id: string, reason: string): Observable<void> {
    let url = `${this.ctrlUrl}/return/${id}`;

    if (reason) {
      url += `?reason=${reason}`;
    }

    return this.http.patch<void>(`${url}`, undefined);
  }

  searchRepairAsync<T>(
      payload: SearchRequest,
      
    ): Observable<SearchResponse<T>> {
      this.searchIsLoading.next(true);
  
      return this.http
        .post<SearchResponse<T>>(
          `${this.ctrlUrl}/search`,
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

  public searchAsync(
    serviceRequestSearchRequestModel: ServiceRequestSearchRequestModel
  ): Observable<PagedList<ServiceRequestModel>> {
    return this.http.post<PagedList<ServiceRequestModel>>(
      `${this.ctrlUrl}/search`,
      serviceRequestSearchRequestModel
    );
  }
}
