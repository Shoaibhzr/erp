import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStoreGroupToCompanyPipe } from './user-storegroup-to-company.pipe';
import { UserStoreGroupToCompanyDetailPipe } from './user-storegroup-to-company-detail.pipe ';
import { UserStoreGroupToCompanyAuditor1DetailPipe } from './user-storegroup-to-company-auditor1-detail.pipe ';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserStoreGroupToCompanyPipe,
    UserStoreGroupToCompanyDetailPipe,
    UserStoreGroupToCompanyAuditor1DetailPipe
  ],
  exports: [
    UserStoreGroupToCompanyPipe,
    UserStoreGroupToCompanyDetailPipe,
    UserStoreGroupToCompanyAuditor1DetailPipe
  ]
})
export class UserStoreGroupToCompanyPipeModule { }
