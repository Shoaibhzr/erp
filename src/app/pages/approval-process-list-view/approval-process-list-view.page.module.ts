import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';

/** Page */
import { ApprovalProcessListViewPage } from './approval-process-list-view.page';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';

@NgModule({
  declarations: [
    ApprovalProcessListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SpinnerComponent,
    CustomPaginationComponent,
    PaginationModule.forRoot()
  ],
  providers: [
  ]
})

export class ApprovalProcessListViewPageModule { }
