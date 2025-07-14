import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTwoDecimalLimit]',
  standalone: true,
})
export class TwoDecimalDirective {
  constructor(private control: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    if (!value) return;

    const trimmed = value.replace(/^(\d+)\.(\d{0,2}).*$/, '$1.$2');
    if (trimmed !== value) {
      this.control.control?.setValue(trimmed);
    }
  }
}
