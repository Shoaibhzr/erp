import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';

/** Page */
import { StoreListViewPage } from './store-list-view.page';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';

@NgModule({
  declarations: [
    StoreListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
     CustomPaginationComponent,
    SpinnerComponent,
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
  ],
  providers: [
  ]
})

export class StoreListViewPageModule { }
