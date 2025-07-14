import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Environment */
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/Configuration`;

  constructor(private http: HttpClient) { }

}
