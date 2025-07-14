import { catchError, EMPTY, Observable, of, tap, delay } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';

/** Models */
import { FileModel } from '../models/file-model';

/** Environment */
import { environment } from '../../environments/environment';
import { ToasterService } from '../utils/toaster.service';
import {
  AccountsPayableReadModel,
  AccountsPayableWriteModel,
  CoaCategory,
  Store,
  VendorSubsidiary,
} from '../models/accounts-payable';
import { StoreGroup } from '../models/response/store-groups';
import { Ocr } from '../models/ocr';

@Injectable({
  providedIn: 'root',
})
export class AccountsPayableService {
  private ctrlUrl: string = `${environment.apiUrl}/v1/AccountsPayable`;
  byPassedHttp: HttpClient;
  constructor(
    private http: HttpClient,
    private toasterSvc: ToasterService,
    private httpBackend: HttpBackend
  ) {
    this.byPassedHttp = new HttpClient(httpBackend);
  }

  public uploadAttachmentAsync(formData: FormData) {
    return this.http.post<FileModel>(
      `${this.ctrlUrl}/upload/attachment`,
      formData
    );
  }

  withdrawRequest(id: string) {
    return this.http
      .patch<void>(
        `${environment.apiUrl}/v1/servicerequest/withdraw/${id}`,
        null
      )
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request withdrawn successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  getDetails(id: string) {
    return this.http
      .get<AccountsPayableReadModel>(`${this.ctrlUrl}/${id}`)
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  getVendorSubsidiary(vendorId: string) {
    return this.http
      .get<VendorSubsidiary[]>(`/v1/vendor/search/subsidiary/${vendorId}`)
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  getStoreGroups(companyId: string) {
    return this.http
      .get<StoreGroup[]>(`/v1/store/storegroup/company/${companyId}`)
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  getStores(groupIds: Array<string>) {
    return this.http
      .post<Store[]>(`/v1/store/storegroup/store`, { ids: groupIds })
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  getCoaCateogry() {
    return this.http
      .get<CoaCategory[]>(`${this.ctrlUrl}/search/chartofaccounts`)
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return of([]);
        })
      );
  }

  createRequest(
    payload: AccountsPayableWriteModel
  ): Observable<AccountsPayableReadModel> {
    return this.http
      .post<AccountsPayableReadModel>(`${this.ctrlUrl}`, payload)
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request created successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  updateRequest(
    payload: AccountsPayableWriteModel
  ): Observable<AccountsPayableReadModel> {
    return this.http
      .put<AccountsPayableReadModel>(`${this.ctrlUrl}`, payload)
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request updated successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  delteRequestItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ctrlUrl}/${id}`).pipe(
      tap(() => {
        this.toasterSvc.showSuccess('Item deleted successfully');
      }),
      catchError((error) => {
        this.toasterSvc.showError(
          error?.message || 'Something went wrong. Please try again later.'
        );
        return EMPTY;
      })
    );
  }

  approveRequest(id: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/${id}`, null).pipe(
      tap(() => {
        this.toasterSvc.showSuccess('Request approved successfully');
      }),
      catchError((error) => {
        this.toasterSvc.showError(
          error?.message || 'Something went wrong. Please try again later.'
        );
        return EMPTY;
      })
    );
  }

  rejectRequest(id: string, reason: string): Observable<void> {
    return this.http
      .patch<void>(`${this.ctrlUrl}/reject/${id}?reason=${reason}`, null)
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request approved successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  returnRequest(id: string, reason: string): Observable<void> {
    return this.http
      .patch<void>(`${this.ctrlUrl}/return/${id}?reason=${reason}`, null)
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request returned successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  referRequest(id: string): Observable<void> {
    return this.http
      .patch<void>(`${this.ctrlUrl}/refer/admin/${id}`, null)
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request referred successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  integrateRequest(id: string): Observable<void> {
    return this.http
      .post<void>(`${this.ctrlUrl}/netsuitebill`, {
        id,
      })
      .pipe(
        tap(() => {
          this.toasterSvc.showSuccess('Request integrated successfully');
        }),
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }

  processDocument(file: File) {
    const formData = new FormData();
    formData.append('document', file);
    const headers = new HttpHeaders({
      Accept: '*/*',
    });

    return this.byPassedHttp
      .post<Ocr>(
        'https://mealdynamicsqavm.northcentralus.cloudapp.azure.com:3000/process-document',
        formData,
        { headers }
      )
      .pipe(
        catchError((error) => {
          this.toasterSvc.showError(
            error?.message || 'Something went wrong. Please try again later.'
          );
          return EMPTY;
        })
      );
  }
}
