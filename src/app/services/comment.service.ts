import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Models */
import { FileModel } from '../models/file-model';
import { CommentModel } from '../models/comment-model';
import { PagedList } from '../models/common/paged-list';
import { CommentCreateRequestModel } from '../models/request/comment-create-request-model';
import { CommentUpdateRequestModel } from '../models/request/comment-update-request-model';
import { CommentSearchRequestModel } from '../models/request/comment-search-request-model';


/** Environment */
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/comment`;

  constructor(private http: HttpClient) {
  }

  public createAsync(commentCreateRequestModel: CommentCreateRequestModel): Observable<CommentModel> {
    return this.http.post<CommentModel>(`${this.ctrlUrl}`, commentCreateRequestModel);
  }

  public updateAsync(commentUpdateRequestModel: CommentUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, commentUpdateRequestModel);
  }

  public searchAsync(commentSearchRequestModel: CommentSearchRequestModel): Observable<PagedList<CommentModel>> {
    return this.http.post<PagedList<CommentModel>>(`${this.ctrlUrl}/search`, commentSearchRequestModel);
  }

  public uploadAttachmentAsync(formData: FormData): Observable<FileModel> {
    return this.http.post<FileModel>(`${this.ctrlUrl}/upload/attachment`, formData);
  }

}
