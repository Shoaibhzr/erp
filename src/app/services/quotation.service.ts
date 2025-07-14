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
export class QuotationService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/quotation`;

  constructor(private http: HttpClient) {
  }

  public createAsync(quotationCreateRequestModel: QuotationCreateRequestModel): Observable<QuotationModel> {
    return this.http.post<QuotationModel>(`${this.ctrlUrl}`, quotationCreateRequestModel);
  }

  public updateAsync(quotationUpdateRequestModel: QuotationUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, quotationUpdateRequestModel);
  }

  public uploadAttachmentAsync(formData: FormData): Observable<FileModel> {
    return this.http.post<FileModel>(`${this.ctrlUrl}/upload/attachment`, formData);
  }

  public approveAsync(quotationId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/${quotationId}`, undefined);
  }

  public rejectAsync(quotationId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/reject/${quotationId}`, undefined);
  }

  public approveItemAsync(quotationItemId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/approve/item/${quotationItemId}`, undefined);
  }

  public rejectItemAsync(quotationItemId: string): Observable<void> {
    return this.http.patch<void>(`${this.ctrlUrl}/reject/item/${quotationItemId}`, undefined);
  }

}
