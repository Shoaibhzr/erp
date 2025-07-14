import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

/** Page */
import { HomePage } from './home.page';

@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgApexchartsModule
  ],
  providers: [
  ]
})

export class HomePageModule { }
