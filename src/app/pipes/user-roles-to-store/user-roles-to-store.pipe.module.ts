import { NgModule } from '@angular/core';
import { UserRolesToStorePipe } from './user-roles-to-store.pipe';
import { CommonModule } from '@angular/common';
import { UserStoreNameToStorePipe } from './user-store-name-to-store.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserRolesToStorePipe,
    UserStoreNameToStorePipe
  ],
  exports: [
    UserRolesToStorePipe,
    UserStoreNameToStorePipe
  ]
})
export class UserRolesToStorePipeModule { }
