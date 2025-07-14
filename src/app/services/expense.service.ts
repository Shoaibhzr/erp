import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, Observable, tap } from 'rxjs';

/** Models */
import { FileModel } from '../models/file-model';

/** Environment */
import { environment } from '../../environments/environment';
import { ServiceRequestStatus } from '../models/service-request-status';
import { ServiceRequestModel } from '../models/service-request-model';
import { ServiceRequestSearchRequestModel } from '../models/request/service-request-search-request-model';
import { ApprovalProcessSearchRequestModel } from '../models/request/approval-process-search-request-model';
import { ApprovalProcessModel } from '../models/approval-process-model';
import { PagedList } from '../models/common/paged-list';
import { ToasterService } from '../utils/toaster.service';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {

    private ctrlUrl: string = `${environment.apiUrl}/v1/expense`;

    constructor(private http: HttpClient, private toasterSvc: ToasterService) {
    }

    public searchByAsync(status: ServiceRequestSearchRequestModel): Observable<void> {
        return this.http.post<void>(`${this.ctrlUrl}/search`, status);
    }

    public getByIdAsync(id: string): Observable<ServiceRequestModel> {
        return this.http.get<ServiceRequestModel>(`${this.ctrlUrl}/${id}`);
    }

    public approveAsync(id: string): Observable<void> {
        return this.http.patch<void>(`${this.ctrlUrl}/approve/${id}`, undefined);
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

   public referRequest(id: string): Observable<void> {
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
    

    public searchApprovalProcessAsync(approvalProcessSearchRequestModel: ApprovalProcessSearchRequestModel): Observable<PagedList<ApprovalProcessModel>> {
        return this.http.post<PagedList<ApprovalProcessModel>>(`${this.ctrlUrl}/approval-process/search`, approvalProcessSearchRequestModel);
    }

}