import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenderListViewComponent } from './vender-list-view/vender-list-view.component';
import { UserRolesToStorePipeModule } from 'src/app/pipes/user-roles-to-store/user-roles-to-store.pipe.module';
import { UserRolesToRolePipeModule } from 'src/app/pipes/user-roles-to-role/user-roles-to-role.pipe.module';
import { VendersRoutingModule } from './venders-routing.module';
import { UserPrefixPipeModule } from 'src/app/pipes/user-prefix/user-prefix.pipe.module';
import { UserRolesToCompanyPipeModule } from 'src/app/pipes/user-roles-to-company/user-roles-to-company.pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { VenderCreatePage } from './vender-create/vender-create.page';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    VenderListViewComponent,
    VenderCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VendersRoutingModule,
    UserRolesToRolePipeModule,
    SpinnerComponent,
    UserPrefixPipeModule,
    NgSelectModule,
    TooltipModule,
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot()
  ]
})
export class VendersModule { }
