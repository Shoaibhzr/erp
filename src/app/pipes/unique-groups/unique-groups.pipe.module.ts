import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UniqueGroupsPipe } from './unique-groups.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UniqueGroupsPipe
  ],
  exports: [
    UniqueGroupsPipe
  ]
})
export class UniqueGroupsPipeModule { }
