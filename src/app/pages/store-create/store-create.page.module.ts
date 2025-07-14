import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/** Page */
import { StoreCreatePage } from './store-create.page';

/** Modules */
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    StoreCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule
  ],
  providers: [
  ]
})

export class StoreCreatePageModule { }
