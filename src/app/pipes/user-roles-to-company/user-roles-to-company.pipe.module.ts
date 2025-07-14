import { NgModule } from '@angular/core';
import { UserRolesToCompanyPipe } from './user-roles-to-company.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserRolesToCompanyPipe
  ],
  exports: [
    UserRolesToCompanyPipe
  ]
})
export class UserRolesToCompanyPipeModule { }
