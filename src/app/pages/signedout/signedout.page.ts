import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'signedout',
  templateUrl: './signedout.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SignedoutPage implements OnInit, OnDestroy {

  constructor(private cd: ChangeDetectorRef, private router: Router) {
  }

  ngOnInit() {
  }

  private markForCheck(): void {
    this.cd.markForCheck();
  }

  ngOnDestroy() {
  }

}
