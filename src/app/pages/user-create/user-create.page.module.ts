import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

/** Page */
import { UserCreatePage } from './user-create.page';

/** Modules */
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    UserCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule,
    TooltipModule
  ],
  providers: [
  ]
})

export class UserCreatePageModule { }
