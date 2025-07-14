import { Directive, ElementRef, AfterContentInit, Input } from '@angular/core';

@Directive({
  selector: '[customAutofocus]'
})
export class CustomAutofocusDirective implements AfterContentInit {

  private _shouldFocus: boolean;

  @Input()
  public set shouldFocus(shouldFocus: boolean) {

    this._shouldFocus = shouldFocus;

    if (this.isInIt) {

      this.focus();

    }

  }

  public get shouldFocus() {

    return this._shouldFocus;

  }

  private isInIt: boolean;

  constructor(private elementRef: ElementRef) { };

  ngAfterContentInit() {

    if (!this.isInIt) {

      this.focus();

    }

  }

  private focus(): void {

    setTimeout(() => {

      this.elementRef.nativeElement.focus();

      this.isInIt = true;

    },500);

  }

}
