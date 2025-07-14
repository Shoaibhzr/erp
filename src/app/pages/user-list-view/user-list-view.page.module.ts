import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

/** Page */
import { UserListViewPage } from './user-list-view.page';

/** Modules */
import { UserRolesToCompanyPipeModule } from '../../pipes/user-roles-to-company/user-roles-to-company.pipe.module';
import { UserRolesToStorePipeModule } from '../../pipes/user-roles-to-store/user-roles-to-store.pipe.module';
import { UserRolesToRolePipeModule } from '../../pipes/user-roles-to-role/user-roles-to-role.pipe.module';
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';
import { UserStoreToCompanyPipeModule } from 'src/app/pipes/user-store-company/user-store-to-company.pipe.module';
import { UserStoreGroupToCompanyPipeModule } from 'src/app/pipes/user-storegroup-company/user-storegroup-to-company.pipe.module';

@NgModule({
  declarations: [
    UserListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserRolesToCompanyPipeModule,
    UserRolesToStorePipeModule,
    UserRolesToRolePipeModule,
    UserPrefixPipeModule,
    UserStoreToCompanyPipeModule,
    UserStoreGroupToCompanyPipeModule,
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [
  ]
})

export class UserListViewPageModule { }
