import { NgModule } from '@angular/core';
import { UserPrefixPipe } from './user-prefix.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UserPrefixPipe
  ],
  exports: [
    UserPrefixPipe
  ]
})
export class UserPrefixPipeModule { }
