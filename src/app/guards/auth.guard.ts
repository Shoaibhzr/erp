import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

/** Services */
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { StorageKey } from '../models/common';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService, private storageSvc: StorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return new Observable<boolean>(observer => {
      
      let state: boolean = false;

      this.authSvc.isLoggedIn().subscribe((isLoggedIn: boolean) => {

        if (isLoggedIn) {

          state = true;

        }
        else {

          this.router.navigateByUrl('/login');

        }

        observer.next(state);

        observer.complete();

      });

    });

  }

}
