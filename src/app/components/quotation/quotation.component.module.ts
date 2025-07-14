import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { ContentTypeToRiIconPipeModule } from '../../pipes/content-type-to-ri-icon/content-type-to-ri-icon.pipe.module';

/** Page */
import { QuotationComponent } from './quotation.component';
import { QuotationStatusPipeModule } from '../../pipes/quotation-status/quotation-status.pipe.module';

@NgModule({
  declarations: [
    QuotationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserPrefixPipeModule,
    ContentTypeToRiIconPipeModule,
    QuotationStatusPipeModule
  ],
  exports: [
    QuotationComponent
  ]
})

export class QuotationComponentModule { }
