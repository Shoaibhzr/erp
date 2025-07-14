import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Environment */
import { environment } from '../../environments/environment';
import { ExpenseCategoryModel } from '../models/expense-category-model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {

  private ctrlUrl: string = `${environment.apiUrl}/v1/ExpenseCategory`;

  constructor(private http: HttpClient) {
  }

  public getAsync(): Observable<ExpenseCategoryModel[]> {

    return this.http.get<ExpenseCategoryModel[]>(`${this.ctrlUrl}`);

  }

}
