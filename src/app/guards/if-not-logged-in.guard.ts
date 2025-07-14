import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

/** Services */
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

@Injectable()
export class IfNotLoggedInGuard  {

  constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService, private storageSvc: StorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    
    return new Observable<boolean>(observer => {

      let state: boolean = false;
      
      this.authSvc.isLoggedIn().subscribe((isLoggedIn: boolean) => {
        
        state = !isLoggedIn;

        if (isLoggedIn) {

          this.router.navigateByUrl('/');

        }

        observer.next(state);

        observer.complete();

      });

    });

  }

  private getParams(route: ActivatedRouteSnapshot): any {

    let queryParams: any = {};

    Object.keys(route.queryParams).forEach(param => {

      queryParams[param] = route.queryParams[param];

    });

    return queryParams;

  }

}
