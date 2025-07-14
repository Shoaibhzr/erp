import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Modules */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { PriorityPipeModule } from '../../pipes/priority/priority.pipe.module';
import { ServiceRequestStatusPipeModule } from '../../pipes/service-request-status/service-request-status.pipe.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';

/** Page */
import { ServiceRequestListViewComponent } from './service-request-list-view.component';

@NgModule({
  declarations: [
    ServiceRequestListViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserPrefixPipeModule,
    PriorityPipeModule,
    ServiceRequestStatusPipeModule,
    PaginationModule.forRoot()
  ],
  exports: [
    ServiceRequestListViewComponent
  ]
})

export class ServiceRequestListViewComponentModule { }
