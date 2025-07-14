import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { RepairAndMaintenanceDetailViewPage } from './repair-and-maintenance-detail-view.page';
import { PriorityPipeModule } from '../../pipes/priority/priority.pipe.module';
import { ServiceRequestStatusPipeModule } from '../../pipes/service-request-status/service-request-status.pipe.module';

/** Modules */
import { CommentComponentModule } from '../../components/comment/comment.component.module';
import { QuotationComponentModule } from '../../components/quotation/quotation.component.module';
import { InvoiceComponentModule } from '../../components/invoice/invoice.component.module';
import { PaymentComponentModule } from '../../components/payment/payment.component.module';
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { InviteVendorComponentModule } from '../../components/invite-vendor/invite-vendor.component.module';
import { CompletePaymentComponentModule } from '../../components/complete-payment/complete-payment.component.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';
import { QuotationStatusPipeModule } from '../../pipes/quotation-status/quotation-status.pipe.module';
import { PaymentMethodPipeModule } from '../../pipes/payment-method/payment-method.pipe.module';
import { ServiceRequestNumberPipeModule } from '../../pipes/service-request-number/service-request-number.pipe.module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    RepairAndMaintenanceDetailViewPage
  ],
  imports: [
    CommonModule,
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
    ServiceRequestNumberPipeModule
  ],
  providers: [
    BsModalService
  ]
})

export class RepairAndMaintenanceDetailViewPageModule { }
