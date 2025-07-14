import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { CompanyCreatePage } from './company-create.page';

/** Modules */
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    CompanyCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    QuillModule.forRoot()
  ],
  providers: [
  ]
})

export class CompanyCreatePageModule { }
