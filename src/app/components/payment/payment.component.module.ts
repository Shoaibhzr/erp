import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';

/** Page */
import { PaymentComponent } from './payment.component';
import { InvoiceStatusPipeModule } from '../../pipes/invoice-status/invoice-status.pipe.module';
import { PaymentMethodPipeModule } from '../../pipes/payment-method/payment-method.pipe.module';

@NgModule({
  declarations: [
    PaymentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    InvoiceStatusPipeModule,
    PaymentMethodPipeModule
  ],
  exports: [
    PaymentComponent
  ]
})

export class PaymentComponentModule { }
