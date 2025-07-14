import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Models */
import { CompanyModel } from '../models/company-model';
import { PagedList } from '../models/common/paged-list';
import { CompanyCreateRequestModel } from '../models/request/company-create-request-model';
import { CompanyUpdateRequestModel } from '../models/request/company-update-request-model';
import { CompanySearchRequestModel } from '../models/request/company-search-request-model';

/** Environment */
import { environment } from '../../environments/environment';
import { UriResponse } from '../models/common/uri-response';
import { UploadLogoRequestModel } from '../models/request/upload-logo-request-model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/company`;

  constructor(private http: HttpClient) {
  }

  public createAsync(companyCreateRequestModel: CompanyCreateRequestModel): Observable<CompanyModel> {
    return this.http.post<CompanyModel>(`${this.ctrlUrl}`, companyCreateRequestModel);
  }

  public updateAsync(companyUpdateRequestModel: CompanyUpdateRequestModel): Observable<void> {
    return this.http.put<void>(`${this.ctrlUrl}`, companyUpdateRequestModel);
  }

  public searchAsync(companySearchRequestModel: CompanySearchRequestModel): Observable<PagedList<CompanyModel>> {
    return this.http.post<PagedList<CompanyModel>>(`${this.ctrlUrl}/search`, companySearchRequestModel);
  }

  public generateSasForLogoUploadAsync(): Observable<UriResponse> {
    return this.http.get<UriResponse>(`${this.ctrlUrl}/logo/generate/sas/upload`);
  }

  public uploadLogoAsync(formData: FormData): Observable<UriResponse> {
    return this.http.post<UriResponse>(`${this.ctrlUrl}/upload/logo`, formData);
  }

  public deleteCompanyAsync(company:any) {
    return this.http.delete(`${this.ctrlUrl}/${company}`);
  }

}
