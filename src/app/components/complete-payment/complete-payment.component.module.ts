import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';
import { PaymentMethodPipeModule } from '../../pipes/payment-method/payment-method.pipe.module';

/** Page */
import { CompletePaymentComponent } from './complete-payment.component';

/** 3rd party modules */
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    CompletePaymentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    PaymentMethodPipeModule,
    BsDatepickerModule
  ],
  exports: [
    CompletePaymentComponent
  ]
})

export class CompletePaymentComponentModule { }
