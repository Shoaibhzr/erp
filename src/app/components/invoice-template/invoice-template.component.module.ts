import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';

/** Page */
import { InvoiceTemplateComponent } from './invoice-template.component';
import { InvoiceStatusPipeModule } from '../../pipes/invoice-status/invoice-status.pipe.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { StatusStylePipe } from 'src/app/pipes/status-style.pipe';
import { ServiceRequestNumberPipeModule } from 'src/app/pipes/service-request-number/service-request-number.pipe.module';
import { UniqueGroupsPipeModule } from 'src/app/pipes/unique-groups/unique-groups.pipe.module';

@NgModule({
  declarations: [
    InvoiceTemplateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    StatusStylePipe,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    InvoiceStatusPipeModule,
    ServiceRequestNumberPipeModule,
    UniqueGroupsPipeModule
  ],
  exports: [
    InvoiceTemplateComponent
  ],
  providers: [
    BsModalService
  ]
})

export class InvoiceTemplateComponentModule { }
