import { NgModule } from '@angular/core';
import { InvoiceStatusPipe } from './invoice-status.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    InvoiceStatusPipe
  ],
  exports: [
    InvoiceStatusPipe
  ]
})
export class InvoiceStatusPipeModule { }
