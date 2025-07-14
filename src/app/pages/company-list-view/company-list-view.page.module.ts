import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';

/** Page */
import { CompanyListViewPage } from './company-list-view.page';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';

@NgModule({
  declarations: [
    CompanyListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomPaginationComponent,
    RouterModule,
    SpinnerComponent,
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot()
  ],
  providers: [
  ]
})

export class CompanyListViewPageModule { }
