import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreGroupCreatePage } from './store-group-create.page';

@NgModule({
  declarations: [
    StoreGroupCreatePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule
  ]
})
export class StoreGroupCreatePageModule { }