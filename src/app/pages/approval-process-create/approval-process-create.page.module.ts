import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { ApprovalProcessCreatePage } from './approval-process-create.page';

/** Modules */
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ApprovalProcessCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule,
    QuillModule.forRoot()
  ],
  providers: [
  ]
})

export class ApprovalProcessCreatePageModule { }
