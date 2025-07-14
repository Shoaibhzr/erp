import { NgModule } from '@angular/core';
import { ServiceRequestNumberPipe } from './service-request-number.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ServiceRequestNumberPipe
  ],
  exports: [
    ServiceRequestNumberPipe
  ]
})
export class ServiceRequestNumberPipeModule { }
