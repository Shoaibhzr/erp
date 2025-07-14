import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';

/** Page */
import { InvoiceComponent } from './invoice.component';
import { InvoiceStatusPipeModule } from '../../pipes/invoice-status/invoice-status.pipe.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { StatusStylePipe } from 'src/app/pipes/status-style.pipe';
import { ServiceRequestStatusPipeModule } from 'src/app/pipes/service-request-status/service-request-status.pipe.module';

@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    StatusStylePipe,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    InvoiceStatusPipeModule
  ],
  exports: [
    InvoiceComponent
  ],
  providers: [
    BsModalService
  ]
})

export class InvoiceComponentModule { }
