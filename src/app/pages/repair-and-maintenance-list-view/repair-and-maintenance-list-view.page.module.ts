import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Page */
import { RepairAndMaintenanceListViewPage } from './repair-and-maintenance-list-view.page';

/** Pipes */
import { PriorityPipeModule } from '../../pipes/priority/priority.pipe.module';

/** Modules */
import { ServiceRequestListViewComponentModule } from '../service-request-list-view/service-request-list-view.component.module';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { CustomPaginationComponent } from 'src/app/components/custom-pagination/custom-pagination.component';
import { StatusStylePipe } from 'src/app/pipes/status-style.pipe';
import { ServiceRequestStatusPipeModule } from 'src/app/pipes/service-request-status/service-request-status.pipe.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [
    RepairAndMaintenanceListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PriorityPipeModule,
    SpinnerComponent,
    CustomPaginationComponent,
    BsDropdownModule,
    StatusStylePipe,
    ServiceRequestStatusPipeModule,
    ServiceRequestListViewComponentModule
  ],
  providers: [
  ]
})

export class RepairAndMaintenanceListViewPageModule { }
