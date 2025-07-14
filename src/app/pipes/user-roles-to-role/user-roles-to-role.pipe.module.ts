import { NgModule } from '@angular/core';
import { UserRolesToRolePipe } from './user-roles-to-role.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserRolesToRolePipe
  ],
  exports: [
    UserRolesToRolePipe
  ]
})
export class UserRolesToRolePipeModule { }
