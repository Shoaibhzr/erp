import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  Observable,
  BehaviorSubject,
  finalize,
  take,
  combineLatest,
  tap,
  map,
  withLatestFrom,
} from 'rxjs';
import {
  AccountsPayableReadModel,
  AccountsPayableReadModelItem,
} from 'src/app/models/accounts-payable';
import { ApprovalState } from 'src/app/models/approval-state';
import { RoleConstant } from 'src/app/models/role-constant';
import { ServiceRequestStatus } from 'src/app/models/service-request-status';
import { AccountsPayableService } from 'src/app/services/accounts-payable.service';
import { ContextService } from 'src/app/services/context.service';
import { Helpers } from 'src/app/utils/helpers-util';

@Component({
  selector: 'app-accounts-payable-view-details',
  templateUrl: './accounts-payable-view-details.component.html',
  styleUrls: ['./accounts-payable-view-details.component.scss'],
})
export class AccountsPayableViewDetailsComponent {
  readonly approvalState = ApprovalState;
  readonly serviceRequestStatus = ServiceRequestStatus;
  @ViewChild('approveModal')
  approveModal!: TemplateRef<void>;
  @ViewChild('reasonModal')
  reasonModal!: TemplateRef<void>;
  @ViewChild('referModal')
  referModal!: TemplateRef<void>;
  reasonCtrl = new FormControl('', [
    Validators.required,
    Validators.maxLength(512),
  ]);
  id = '';
  details$: Observable<AccountsPayableReadModel>;
  refetch$ = new BehaviorSubject<boolean>(false);
  isLoading$ = new BehaviorSubject<boolean>(false);
  modalRef?: BsModalRef;
  returnRequest = true;
  isActionNotYetPerformedByTheUser = true;
  canReferToAdmin = false;
  alreadyReferredToAdmin = false;
  hideButtonsIfNonCriticalForAP2 = false;
  fileHelper = Helpers;
  showActionButtons$ = combineLatest([
    this.contextSvc.isAPManger1$,
    this.contextSvc.isAPManger2$,
    this.contextSvc.isCompanyAdmin$,
  ]).pipe(map(([isAP1, isAP2, isAdmin]) => isAP1 || isAP2 || isAdmin));

  constructor(
    private route: ActivatedRoute,
    private accountPayableSvc: AccountsPayableService,
    private modalSvc: BsModalService,
    private contextSvc: ContextService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchDetails();
    }
  }

  trackByIndex(index: number, _: AccountsPayableReadModelItem): number {
    return index;
  }

  fetchDetails() {
    this.isLoading$.next(true);
    this.details$ = this.accountPayableSvc.getDetails(this.id).pipe(
      withLatestFrom(this.contextSvc.isAPManger2$),
      tap(([details, isAPManager2]) => {
        this.isActionNotYetPerformedByTheUser = Boolean(
          (details?.approvals || []).find(
            (item) =>
              item.approver.id === this.contextSvc.user.value.id &&
              item.state === this.approvalState.pending
          )
        );
        this.canReferToAdmin =
          isAPManager2 &&
          Boolean(
            (details?.approvals || []).find(
              (item) =>
                item.role.id === RoleConstant.accountsPayableManager2 &&
                item.state === this.approvalState.approved
            )
          );

        this.alreadyReferredToAdmin = Boolean(
          (details?.approvals || []).find(
            (item) => item.role.id === RoleConstant.companyAdminId
          )
        );

        this.hideButtonsIfNonCriticalForAP2 =
          isAPManager2 &&
          !details.isUrgent &&
          Boolean(
            (details?.approvals || []).find(
              (item) =>
                item.role.id === RoleConstant.accountsPayableManager1 &&
                item.state === this.approvalState.pending
            )
          );
      }),
      map(([details, _]) => details),
      finalize(() => this.isLoading$.next(false))
    );
  }

  onShowReasonDialog(isReturn: boolean) {
    this.returnRequest = isReturn;
    this.reasonCtrl.reset();
    this.modalRef = this.modalSvc.show(this.reasonModal, {
      class: 'modal-dialog-centered',
      ignoreBackdropClick: true,
    });
  }

  onReasonDialogClose() {
    if (this.reasonCtrl.invalid) {
      this.reasonCtrl.markAsTouched();
      return;
    }

    this.modalRef.hide();
    this.isLoading$.next(true);
    this.accountPayableSvc[
      this.returnRequest ? 'returnRequest' : 'rejectRequest'
    ](this.id, this.reasonCtrl.value)
      .pipe(
        take(1),
        tap(() => this.fetchDetails()),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  onShowApproveDialog() {
    this.modalRef = this.modalSvc.show(this.approveModal, {
      class: 'modal-dialog-centered',
      ignoreBackdropClick: true,
    });
  }

  onApprove() {
    this.modalRef.hide();
    this.isLoading$.next(true);
    this.accountPayableSvc
      .approveRequest(this.id)
      .pipe(
        take(1),
        tap(() => this.fetchDetails()),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  onShowReferDialog() {
    this.modalRef = this.modalSvc.show(this.referModal, {
      class: 'modal-dialog-centered',
      ignoreBackdropClick: true,
    });
  }

  onRefer() {
    this.modalRef.hide();
    this.isLoading$.next(true);
    this.accountPayableSvc
      .referRequest(this.id)
      .pipe(
        take(1),
        tap(() => this.fetchDetails()),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  onIntegrate() {
    this.accountPayableSvc
      .integrateRequest(this.id)
      .pipe(
        take(1),
        tap(() => this.fetchDetails()),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }
}
