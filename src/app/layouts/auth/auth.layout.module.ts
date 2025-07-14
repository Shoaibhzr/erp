import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Layout files */
import { AuthLayout } from './auth.layout';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

/** Pipes */
import { UserPrefixPipeModule } from '../../pipes/user-prefix/user-prefix.pipe.module';

@NgModule({
  declarations: [
    AuthLayout
  ],
  imports: [
    CommonModule,
    RouterModule,
    BsDropdownModule.forRoot(),
    UserPrefixPipeModule
  ]
})

export class AuthLayoutModule { }
