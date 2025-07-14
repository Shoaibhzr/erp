import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchRequest, SearchResponse, Url } from '../models/search';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchIsLoading = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.searchIsLoading.asObservable();

  constructor(private http: HttpClient) {}

  searchAsync<T>(
    payload: SearchRequest,
    url: Url
  ): Observable<SearchResponse<T>> {
    this.searchIsLoading.next(true);

    return this.http
      .post<SearchResponse<T>>(
        `${environment.apiUrl}/v1/${url}/search`,
        payload
      )
      .pipe(
        catchError((error) => {
          console.error('Search Error:', error);
          return of(null);
        }),
        finalize(() => {
          this.searchIsLoading.next(false);
        })
      );
  }
}
