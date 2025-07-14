import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesListComponent } from './expenses-list/expenses-list.component';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { ExpensesFilterComponent } from './expenses/expenses-filter.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { CommentComponentModule } from 'src/app/components/comment/comment.component.module';
import { CompletePaymentComponentModule } from 'src/app/components/complete-payment/complete-payment.component.module';
import { InviteVendorComponentModule } from 'src/app/components/invite-vendor/invite-vendor.component.module';
import { InvoiceComponentModule } from 'src/app/components/invoice/invoice.component.module';
import { PaymentComponentModule } from 'src/app/components/payment/payment.component.module';
import { QuotationComponentModule } from 'src/app/components/quotation/quotation.component.module';
import { ContentTypeToRiIconPipeModule } from 'src/app/pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';
import { PaymentMethodPipeModule } from 'src/app/pipes/payment-method/payment-method.pipe.module';
import { PriorityPipeModule } from 'src/app/pipes/priority/priority.pipe.module';
import { QuotationStatusPipeModule } from 'src/app/pipes/quotation-status/quotation-status.pipe.module';
import { ServiceRequestNumberPipeModule } from 'src/app/pipes/service-request-number/service-request-number.pipe.module';
import { ServiceRequestStatusPipeModule } from 'src/app/pipes/service-request-status/service-request-status.pipe.module';
import { UserPrefixPipeModule } from 'src/app/pipes/user-prefix/user-prefix.pipe.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';
import { StatusStylePipe } from 'src/app/pipes/status-style.pipe';
import { InvoiceTemplateComponentModule } from 'src/app/components/invoice-template/invoice-template.component.module';

@NgModule({
  declarations: [
    ExpensesListComponent,
    ExpensesFilterComponent,
    ExpenseDetailComponent
  ],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PriorityPipeModule,
    ServiceRequestStatusPipeModule,
    CommentComponentModule,
    QuotationComponentModule,
    InvoiceComponentModule,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    ModalModule,
    NgSelectModule,
    InviteVendorComponentModule,
    QuotationStatusPipeModule,
    PaymentComponentModule,
    PaymentMethodPipeModule,
    CompletePaymentComponentModule,
    ServiceRequestNumberPipeModule,
    ReactiveFormsModule,
    BsDropdownModule,
    SpinnerComponent,
    StatusStylePipe,
    InvoiceTemplateComponentModule,
    CustomPaginationComponent,
    PaginationModule.forRoot()
  ],
  providers: [
    BsModalService
  ]
})
export class ExpensesModule { }
