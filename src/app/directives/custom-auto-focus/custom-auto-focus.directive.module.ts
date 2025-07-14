import { NgModule } from '@angular/core';

/** Directive */
import { CustomAutofocusDirective } from './custom-auto-focus.directive';

@NgModule({
  declarations: [
    CustomAutofocusDirective
  ],
  exports: [
    CustomAutofocusDirective
  ]
})

export class CustomAutoFocusDirectiveModule { }
