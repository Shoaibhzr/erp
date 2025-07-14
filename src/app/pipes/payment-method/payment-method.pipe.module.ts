import { NgModule } from '@angular/core';
import { PaymentMethodPipe } from './payment-method.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PaymentMethodPipe
  ],
  exports: [
    PaymentMethodPipe
  ]
})
export class PaymentMethodPipeModule { }
