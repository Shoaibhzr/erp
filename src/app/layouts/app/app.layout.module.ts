import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/** Layout files */
import { AppLayout } from './app.layout';

@NgModule({
  declarations: [
    AppLayout
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})

export class AppLayoutModule { }
