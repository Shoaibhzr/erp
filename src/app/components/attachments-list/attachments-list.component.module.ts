import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AttachmentsListComponent } from "./attachments-list.component";


@NgModule({
  declarations: [
    AttachmentsListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    AttachmentsListComponent
  ]
})

export class AttachmentsListComponentModule { }
