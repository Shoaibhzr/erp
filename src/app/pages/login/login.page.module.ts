import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { LoginPage } from './login.page';
import { ChangePasswordOtpComponent } from 'src/app/components/change-password-otp/change-password-otp.component';

@NgModule({
  declarations: [
    LoginPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ChangePasswordOtpComponent
  ],
  providers: [
  ]
})

export class LoginPageModule { }
