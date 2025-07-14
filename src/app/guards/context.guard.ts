import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { StorageKey } from '../models/common';

/** Services */
import { UserService } from '../services/user.service';
import { ContextService } from '../services/context.service';
import { StorageService } from "../services/storage.service";
import { SessionStorageConstants } from '../models/common/session-storage-constants';
import { SessionStorageService } from '../services/sessions-storage.service';

@Injectable()
export class ContextGuard implements CanActivate {

  constructor(private userSvc: UserService, private contextSvc: ContextService,
    private storageSvc: StorageService, private router: Router,
    private sessionStorageService: SessionStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return new Observable<boolean>(observer => {

      this.userSvc.getMyAsync().subscribe(

        (data) => {

          this.contextSvc.user.next(data);
          this.sessionStorageService.setItem(SessionStorageConstants.USER, data)
          observer.next(true);
          observer.complete();

        },
        (error) => {

          this.storageSvc.remove(StorageKey.jwt);

          this.storageSvc.remove(StorageKey.refreshToken);

          this.router.navigateByUrl('/auth/error');

        }
      );

    });

  }

}
