import { NgModule } from '@angular/core';
import { ContentTypeToRiIconPipe } from './content-type-to-ri-icon.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ContentTypeToRiIconPipe
  ],
  exports: [
    ContentTypeToRiIconPipe
  ]
})
export class ContentTypeToRiIconPipeModule { }
