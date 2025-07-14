import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { OtpComponent } from 'src/app/components/otp/otp.component';
import { UserRolesToRolePipe } from 'src/app/pipes/user-roles-to-role/user-roles-to-role.pipe';
import { UserRolesToCompanyPipe } from 'src/app/pipes/user-roles-to-company/user-roles-to-company.pipe';
import { UserRolesToStorePipe } from 'src/app/pipes/user-roles-to-store/user-roles-to-store.pipe';
import { UserRolesToStorePipeModule } from 'src/app/pipes/user-roles-to-store/user-roles-to-store.pipe.module';
import { UserRolesToRolePipeModule } from 'src/app/pipes/user-roles-to-role/user-roles-to-role.pipe.module';
import { UserRolesToCompanyPipeModule } from 'src/app/pipes/user-roles-to-company/user-roles-to-company.pipe.module';
import { UserPrefixPipeModule } from 'src/app/pipes/user-prefix/user-prefix.pipe.module';

@NgModule({
  declarations: [
    ChangePasswordComponent,
    ChangeEmailComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    OtpComponent,
    UserRolesToStorePipeModule,
    UserRolesToRolePipeModule,
    UserRolesToCompanyPipeModule,
    UserPrefixPipeModule,
  ],

  exports: [OtpComponent],
  providers: [UserRolesToRolePipe]
})
export class ProfileModule { }
