import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from './../../environments/environment';
import { StorageService } from '../services/storage.service';
import { StorageKey } from '../models/common';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  private readonly _appType: string = "Broker";

  constructor(private storageSvc: StorageService) { }

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.storageSvc.get(StorageKey.jwt);

    let url: string = httpRequest.url;

    if (!url.startsWith('http')) {

      url = `${environment.apiUrl}${httpRequest.url}`;

    }

    if (token) {

      let newHeaders = new HttpHeaders({
        "Authorization": `Bearer ${token}`,
        "AppType": this._appType
      });

      const req = httpRequest.clone({ url: url, headers: newHeaders });

      return next.handle(req);

    } else {

      return next.handle(httpRequest.clone({ url: url }));

    }

  }

}
