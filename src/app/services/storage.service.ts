import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** Models */
import { StorageKey } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public set(key: StorageKey, data: any, isPersistent: boolean = true): Observable<void> {

    return new Observable<void>((observer) => {

      data = (typeof data === 'object' ? JSON.stringify(data) : data);

      isPersistent ? localStorage.setItem(key, data) : sessionStorage.setItem(key, data);

      observer.next(null);
      observer.complete();

    });

  }

  public get(key: StorageKey): any {

    let data = sessionStorage.getItem(key);

    if (!data) {

      data = localStorage.getItem(key);

    }

    if (data) {

      try {

        data = JSON.parse(data);

      }
      catch {

      }

    }

    return data;

  }

  public getAsync(key: StorageKey): Observable<any> {

    return new Observable<any>((observer) => {

      observer.next(this.get(key));

      observer.complete();

    });

  }

  public remove(key: StorageKey): Observable<void> {

    return new Observable<any>((observer) => {

      sessionStorage.removeItem(key);

      localStorage.removeItem(key);

      observer.next(null);

      observer.complete();

    });

  }

}
