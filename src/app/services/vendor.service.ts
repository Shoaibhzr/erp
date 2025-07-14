import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, Observable } from 'rxjs';

/** Models */
import { UserModel, VendorSubsidiary } from '../models/user-model';
import { PagedList } from '../models/common/paged-list';
import { VendorSearchRequestModel } from '../models/request/vendor-search-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { ToasterService } from '../utils/toaster.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/vendor`;

  constructor(private http: HttpClient, private toasterSvc: ToasterService) {
  }

   public getSubsidiaryAsync(): Observable<any> {
    return this.http.get<any>(`${this.ctrlUrl}/search/subsidiary`);
  }

  public getVendorSubsidiary(vendorId: string) {
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

  public searchAsync(vendorSearchRequestModel: VendorSearchRequestModel): Observable<PagedList<UserModel>> {
    return this.http.post<PagedList<UserModel>>(`${this.ctrlUrl}/search`, vendorSearchRequestModel);
  }

}
