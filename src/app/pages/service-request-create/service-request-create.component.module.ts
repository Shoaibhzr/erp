import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { PriorityPipeModule } from '../../pipes/priority/priority.pipe.module';
import { ServiceRequestStatusPipeModule } from '../../pipes/service-request-status/service-request-status.pipe.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';

/** Page */
import { ServiceRequestCreateComponent } from './service-request-create.component';

@NgModule({
  declarations: [
    ServiceRequestCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserPrefixPipeModule,
    PriorityPipeModule,
    ServiceRequestStatusPipeModule,
    BsDatepickerModule,
    NgSelectModule
  ],
  exports: [
    ServiceRequestCreateComponent
  ]
})

export class ServiceRequestCreateComponentModule { }
