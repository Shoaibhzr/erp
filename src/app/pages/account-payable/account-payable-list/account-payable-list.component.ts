import { Component, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AccountsPayable } from 'src/app/models/accounts-payable';
import { SearchRequest, SearchType } from 'src/app/models/search';
import { ServiceRequestStatus } from 'src/app/models/service-request-status';
import { SearchService } from 'src/app/services/search.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccountsPayableService } from 'src/app/services/accounts-payable.service';

@Component({
  selector: 'app-account-payable-list',
  templateUrl: './account-payable-list.component.html',
  styleUrls: ['./account-payable-list.component.scss'],
})
export class AccountPayableListComponent {
  modalRef?: BsModalRef;
  selectedItemId: string;
  readonly serviceRequestStatus = ServiceRequestStatus;
  readonly statuses = [
    ServiceRequestStatus.pendingApproval,
    ServiceRequestStatus.approved,
    ServiceRequestStatus.rejected,
  ];
  isLoading$ = new BehaviorSubject<boolean>(false);
  refetch$ = new BehaviorSubject<boolean>(false);
  searchCtrl = new FormControl('');
  statusCtrl = new FormControl('');
  pageCtrl = new FormControl(1);
  private searchTerm$ = this.searchCtrl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.pageCtrl.setValue(1, { emitEvent: false }))
  );
  private status$ = this.statusCtrl.valueChanges.pipe(
    startWith(''),
    distinctUntilChanged(),
    tap(() => this.pageCtrl.setValue(1, { emitEvent: false }))
  );
  private page$ = this.pageCtrl.valueChanges.pipe(
    startWith(1),
    distinctUntilChanged()
  );
  list$ = combineLatest([
    this.searchTerm$,
    this.status$,
    this.page$,
    this.refetch$,
  ]).pipe(
    debounceTime(50),
    tap(() => {
      this.isLoading$.next(true);
    }),
    switchMap(([search, status, _page, _reFetch]) => {
      const payload = {
        type: SearchType.accountsPayable,
        page: this.pageCtrl.value,
        pageSize: 10,
        keyword: search,
        status: status ? [status] : '',
      } as SearchRequest;

      if (!search) delete payload.keyword;
      if (!status) delete payload.status;

      return this.searchSvc
        .searchAsync<AccountsPayable>(payload, 'servicerequest')
        .pipe(
          tap(() => {
            this.isLoading$.next(false);
          })
        );
    })
  );

  constructor(
    private searchSvc: SearchService,
    private accountPayableSvc: AccountsPayableService,
    private modalSvc: BsModalService
  ) {}

  trackByFn(index: number, item: AccountsPayable) {
    return item.id;
  }

  onPageChanged(page: number): void {
    this.pageCtrl.setValue(page);
  }

  openModal(template: TemplateRef<any>, id: string) {
    this.selectedItemId = id;
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-centered',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  onConfirmWithdraw() {
    this.modalRef?.hide();
    this.isLoading$.next(true);
    this.accountPayableSvc
      .withdrawRequest(this.selectedItemId)
      .pipe(
        take(1),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe(() => this.refetch$.next(true));
  }
}
