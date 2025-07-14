import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable()
export class ConfigGuard  {

  constructor(private translateSvc: TranslateService, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return new Observable<boolean>(observer => {

      this.http.get(`${window.location.origin}/en.json`).subscribe((data) => {

        this.translateSvc.setTranslation('en', data);
        this.translateSvc.setDefaultLang('en');
        this.translateSvc.use('en');

        observer.next(true);
        observer.complete();

      });

    });

  }

}
