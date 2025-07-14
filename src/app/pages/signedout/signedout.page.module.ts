import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Page */
import { SignedoutPage } from './signedout.page';

@NgModule({
  declarations: [
    SignedoutPage
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SignedoutPage
      }
    ])
  ],
  providers: [
  ]
})

export class SignedoutPageModule { }
