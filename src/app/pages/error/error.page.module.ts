import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { ErrorPage } from './error.page';

@NgModule({
  declarations: [
    ErrorPage
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ErrorPage
      }
    ])
  ],
  providers: [
  ]
})

export class ErrorPageModule { }
