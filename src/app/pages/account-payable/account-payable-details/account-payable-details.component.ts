import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  BehaviorSubject,
  finalize,
  map,
  Observable,
  of,
  take,
  tap,
} from 'rxjs';
import {
  AccountsPayableReadModel,
  AccountsPayableWriteModel,
} from 'src/app/models/accounts-payable';
import { AccountsPayableService } from 'src/app/services/accounts-payable.service';
import { OcrDialogComponent } from '../ocr-dialog/ocr-dialog.component';

@Component({
  selector: 'app-account-payable-details',
  templateUrl: './account-payable-details.component.html',
  styleUrls: ['./account-payable-details.component.scss'],
})
export class AccountPayableDetailsComponent {
  id = '';
  details$: Observable<AccountsPayableReadModel>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  constructor(
    private route: ActivatedRoute,
    private accountPayableSvc: AccountsPayableService,
    private router: Router,
    private modalSvc: BsModalService,
    private modalRef: BsModalRef
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isLoading$.next(true);
      this.details$ = this.accountPayableSvc
        .getDetails(this.id)
        .pipe(finalize(() => this.isLoading$.next(false)));
    }
  }

  onEmit(data: AccountsPayableWriteModel) {
    const { id, AccountPayableDetailId, ...rest } = data;
    this.isLoading$.next(true);
    this.accountPayableSvc[this.id ? 'updateRequest' : 'createRequest'](
      this.id ? data : rest
    )
      .pipe(
        take(1),
        tap(() => this.router.navigateByUrl('/accounts-payable/list')),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  onShowDialog() {
    this.modalRef = this.modalSvc.show(OcrDialogComponent, {
      class: 'modal-dialog-centered custom-width-dialog',
      ignoreBackdropClick: true,
    });

    this.modalRef.content.modalClose
      .pipe(take(1))
      .subscribe((result: AccountsPayableReadModel) => {
        this.details$ = of(result);
      });
  }
}
