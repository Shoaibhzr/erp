import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Models */
import { FileModel } from '../models/file-model';
import { CommentModel } from '../models/comment-model';
import { PagedList } from '../models/common/paged-list';
import { QuotationModel } from '../models/quotation-model';
import { QuotationCreateRequestModel } from '../models/request/quotation-create-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { QuotationUpdateRequestModel } from '../models/request/quotation-update-request-model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/invoice`;

  constructor(private http: HttpClient) {
  }

  public uploadAttachmentAsync(formData: FormData): Observable<FileModel> {
    return this.http.post<FileModel>(`${this.ctrlUrl}/upload/attachment`, formData);
  }

  public approveAsync(invoiceId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/${invoiceId}`, undefined);
  }

  public rejectAsync(invoiceId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/reject/${invoiceId}`, undefined);
  }

  public approveItemAsync(invoiceItemId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/item/${invoiceItemId}`, undefined);
  }

  public rejectItemAsync(invoiceItemId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/reject/item/${invoiceItemId}`, undefined);
  }

}
