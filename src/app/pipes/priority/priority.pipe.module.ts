import { NgModule } from '@angular/core';
import { PriorityPipe } from './priority.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PriorityPipe
  ],
  exports: [
    PriorityPipe
  ]
})
export class PriorityPipeModule { }
