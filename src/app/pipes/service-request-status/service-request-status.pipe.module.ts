import { NgModule } from '@angular/core';
import { ServiceRequestStatusPipe } from './service-request-status.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ServiceRequestStatusPipe
  ],
  exports: [
    ServiceRequestStatusPipe
  ]
})
export class ServiceRequestStatusPipeModule { }
