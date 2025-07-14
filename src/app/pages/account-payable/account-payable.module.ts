import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountPayableRoutingModule } from './account-payable-routing.module';
import { AccountPayableListComponent } from './account-payable-list/account-payable-list.component';
import { StatusStylePipe } from 'src/app/pipes/status-style.pipe';
import { ServiceRequestStatusPipeModule } from 'src/app/pipes/service-request-status/service-request-status.pipe.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';
import { AccountPayableRequestFormComponent } from './account-payable-request-form/account-payable-request-form.component';
import { AccountPayableDetailsComponent } from './account-payable-details/account-payable-details.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccountsPayableViewDetailsComponent } from './accounts-payable-view-details/accounts-payable-view-details.component';
import { CommentComponentModule } from 'src/app/components/comment/comment.component.module';
import { TwoDecimalDirective } from 'src/app/directives/two-decimal-limit.directive';
import { UserPrefixPipeModule } from 'src/app/pipes/user-prefix/user-prefix.pipe.module';
import { OcrDialogComponent } from './ocr-dialog/ocr-dialog.component';

@NgModule({
  declarations: [
    AccountPayableListComponent,
    AccountPayableRequestFormComponent,
    AccountPayableDetailsComponent,
    AccountsPayableViewDetailsComponent,
    OcrDialogComponent,
  ],
  imports: [
    CommonModule,
    AccountPayableRoutingModule,
    StatusStylePipe,
    ServiceRequestStatusPipeModule,
    PaginationModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    SpinnerComponent,
    CustomPaginationComponent,
    BsDatepickerModule,
    NgSelectModule,
    CommentComponentModule,
    TwoDecimalDirective,
    UserPrefixPipeModule,
  ],
})
export class AccountPayableModule {}
