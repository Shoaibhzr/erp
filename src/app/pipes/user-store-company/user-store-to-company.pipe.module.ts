import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStoreToCompanyPipe } from './user-store-to-company.pipe';
import { UserStoreToCompanyDetailPipe } from './user-store-to-company-detail.pipe';
import { UserStoreToCompanyAuditorDetailPipe } from './user-store-to-company-auditor1-detail.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserStoreToCompanyPipe,
    UserStoreToCompanyDetailPipe,
    UserStoreToCompanyAuditorDetailPipe
  ],
  exports: [
    UserStoreToCompanyPipe,
    UserStoreToCompanyDetailPipe,
    UserStoreToCompanyAuditorDetailPipe
  ]
})
export class UserStoreToCompanyPipeModule { }
