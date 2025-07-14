import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Models */
import { FileModel } from '../models/file-model';
import { PaymentModel } from '../models/payment-model';
import { CommentModel } from '../models/comment-model';
import { PagedList } from '../models/common/paged-list';
import { QuotationModel } from '../models/quotation-model';
import { QuotationCreateRequestModel } from '../models/request/quotation-create-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { QuotationUpdateRequestModel } from '../models/request/quotation-update-request-model';
import { PaymentCreateRequestModel } from '../models/request/payment-create-request-model';
import { PaymentUpdateRequestModel } from '../models/request/payment-update-request-model';
import { PaymentItemCreateRequestModel } from '../models/request/payment-item-create-request-model';
import { PaymentItemModel } from '../models/payment-item-model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/payment`;

  constructor(private http: HttpClient) {
  }

  public createAsync(paymentCreateRequestModel: PaymentCreateRequestModel): Observable<PaymentModel> {
    return this.http.post<PaymentModel>(`${this.ctrlUrl}`, paymentCreateRequestModel);
  }

  public createItemAsync(paymentItemCreateRequestModel: PaymentItemCreateRequestModel): Observable<PaymentItemModel> {
    return this.http.post<PaymentItemModel>(`${this.ctrlUrl}/item`, paymentItemCreateRequestModel);
  }

  public updateAsync(paymentUpdateRequestModel: PaymentUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, paymentUpdateRequestModel);
  }

  public uploadAttachmentAsync(formData: FormData): Observable<FileModel> {
    return this.http.post<FileModel>(`${this.ctrlUrl}/upload/attachment`, formData);
  }

}
