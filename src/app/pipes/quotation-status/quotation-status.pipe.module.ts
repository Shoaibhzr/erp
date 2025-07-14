import { NgModule } from '@angular/core';
import { QuotationStatusPipe } from './quotation-status.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    QuotationStatusPipe
  ],
  exports: [
    QuotationStatusPipe
  ]
})
export class QuotationStatusPipeModule { }
