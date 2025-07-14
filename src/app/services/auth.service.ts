import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { StorageKey } from '../models/common';

/** Services */
import { StorageService } from './storage.service';

/** Environments */
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private storageSvc: StorageService, private router: Router) {

  }

  public login(returnUrl: string = ''): Observable<void> {

    return new Observable<void>((observer) => {

      let ctrlUrlLocal: string = "/auth/login";

      if (returnUrl) {
        ctrlUrlLocal += ("?returnUrl=" + returnUrl);
      }

      this.router.navigateByUrl(ctrlUrlLocal);

      observer.next(null);
      observer.complete();

    });

  }

  public logout(): Observable<void> {

    return new Observable<void>((observer) => {

      forkJoin([this.storageSvc.remove(StorageKey.jwt), this.storageSvc.remove(StorageKey.refreshToken)]).subscribe(() => {

        this.router.navigateByUrl("/login");

        observer.next(null);
        observer.complete();

      });

    });

  }

  public isLoggedIn(): Observable<boolean> {

    return new Observable<boolean>((observer) => {

      this.storageSvc.getAsync(StorageKey.jwt).subscribe((x) => {

        let state: boolean = false;

        if (x) {

          state = true;

        }

        observer.next(state);
        observer.complete();

      });

    });

  }

}
