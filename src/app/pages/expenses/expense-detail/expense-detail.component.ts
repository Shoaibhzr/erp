import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest, finalize, map, take, takeUntil, tap, withLatestFrom } from 'rxjs';

/** Services */

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ServiceRequestTab } from 'src/app/models/service-request-tab';
import { QuotationStatus } from 'src/app/models/quotation-status';
import { CompletePaymentComponent } from 'src/app/components/complete-payment/complete-payment.component';
import { ApprovalModel } from 'src/app/models/approval-model';
import { ApprovalState } from 'src/app/models/approval-state';
import { InvoiceStatus } from 'src/app/models/invoice-status';
import { PaymentItemModel } from 'src/app/models/payment-item-model';
import { PaymentModel } from 'src/app/models/payment-model';
import { PaymentStatus } from 'src/app/models/payment-status';
import { ServiceRequestModel } from 'src/app/models/service-request-model';
import { ServiceRequestPriority } from 'src/app/models/service-request-priority';
import { ServiceRequestStatus } from 'src/app/models/service-request-status';
import { UserModel } from 'src/app/models/user-model';
import { ContextService } from 'src/app/services/context.service';
import { ServiceRequestService } from 'src/app/services/service-request.service';
import { ServiceRequestType } from 'src/app/models/service-request-type';
import { ExpenseService } from 'src/app/services/expense.service';
import { InvoiceTemplateComponent } from 'src/app/components/invoice-template/invoice-template.component';
import { RoleConstant } from 'src/app/models/role-constant';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html'
})

export class ExpenseDetailComponent implements OnInit, OnDestroy {

  readonly approvalState = ApprovalState;
  readonly serviceRequestStatus = ServiceRequestStatus;

  @ViewChild('invoiceTemplateComponent') invoiceTemplateComponent: InvoiceTemplateComponent;
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

  public id: string;

  public isInitInProgress: boolean = false;

  public isActionInProgress: boolean;

  public serviceRequestModel: ServiceRequestModel;

  public user: UserModel;

  public approval: ApprovalModel;

  public selectedTab: ServiceRequestTab = ServiceRequestTab.overview;

  public QuotationStatus = QuotationStatus;

  public InvoiceStatus = InvoiceStatus;

  public ServiceRequestTab = ServiceRequestTab;

  public ApprovalState = ApprovalState;

  public ServiceRequestStatus = ServiceRequestStatus;

  public ServiceRequestPriority = ServiceRequestPriority;

  public isHttpRequestInProgress: boolean = false;



  public serviceRequestType = ServiceRequestType;

  private ngUnSubscribe: Subject<void> = new Subject<void>();


  serviceRequestModel$: Observable<ServiceRequestModel>;
    refetch$ = new BehaviorSubject<boolean>(false);
    isLoading$ = new BehaviorSubject<boolean>(false);
    modalRef?: BsModalRef;
    returnRequest = true;
    isActionNotYetPerformedByTheUser = true;
    canReferToAdmin = false;
    alreadyReferredToAdmin = false;
    hideButtonsIfNonCriticalForAU2 = false;

    rejectionOrReturnReason: string = '';
    

    showActionButtons$ = combineLatest([
        this.contextSvc.isAuditor1$,
        this.contextSvc.isAuditor2$,
        this.contextSvc.isCompanyAdmin$,
      ]).pipe(map(([isAUD1, isAUD2, isAdmin]) => isAUD1 || isAUD2 || isAdmin));

  constructor(
    private cd: ChangeDetectorRef,
    private modalSvc: BsModalService,
    private contextSvc: ContextService,
    private serviceRequestSvc: ServiceRequestService,
    private route: ActivatedRoute,
    private expenseService: ExpenseService) {

      this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchDetails();
    }

  }

  ngOnInit() {


  }

  //  trackByIndex(index: number, _: AccountsPayableReadModelItem): number {
  //     return index;
  //   }
  
  fetchDetails(): void {
    this.isLoading$.next(true);
    this.serviceRequestModel$ = this.expenseService.getByIdAsync(this.id).pipe(
      withLatestFrom(this.contextSvc.isAuditor2$),
      tap(([details, isAuditor2]) => {
        this.serviceRequestModel = details;

        const reasonItem = (details?.approvals || []).find(
          (item) =>
            item.state === ApprovalState.rejected ||
            item.state === ApprovalState.returned
        );
        this.rejectionOrReturnReason = reasonItem?.reason || '';

        const approvals = details?.approvals || [];
        const currentUserId = this.contextSvc.user.value.id;
        const isCritical = details?.priority;

        this.isActionNotYetPerformedByTheUser = Boolean(
          approvals.find(
            (item) =>
              item.approver.id === currentUserId &&
              item.state === ApprovalState.pending
          )
        );

        this.canReferToAdmin =
          isAuditor2 &&
          Boolean(
            approvals.find(
              (item) =>
                item.role.id === RoleConstant.auditor2 &&
                item.state === ApprovalState.approved
            )
          );

        this.alreadyReferredToAdmin = Boolean(
          approvals.find((item) => item.role.id === RoleConstant.companyAdminId)
        );

        this.hideButtonsIfNonCriticalForAU2 =
          isAuditor2 &&
          details.priority === ServiceRequestPriority.nonCritical &&
          !approvals.some(
            (item) =>
              item.role.id === RoleConstant.auditor1 &&
              item.state === ApprovalState.approved
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
    this.expenseService[
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
    this.serviceRequestSvc.approveAsync(this.id)
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
    this.expenseService
          .referRequest(this.id)
      .pipe(
        take(1),
        tap(() => this.fetchDetails()),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe();
  }

  onDownloadClicked(): void {
  this.isHttpRequestInProgress = true;
  this.invoiceTemplateComponent.downloadPDF().finally(() => {
    this.isHttpRequestInProgress = false;
  });
}

  public completePayment(): void {

    const initialState: ModalOptions = {
      class: "modal-lg",
      initialState: {
        serviceRequest: this.serviceRequestModel
      }
    };

    this.modalRef = this.modalSvc.show(CompletePaymentComponent, initialState);

    this.modalRef.content.onCreated.pipe(takeUntil(this.ngUnSubscribe)).subscribe((x: PaymentModel) => {

      this.serviceRequestModel.payment = x;

      if (this.serviceRequestModel.payment.status === PaymentStatus.paid) {

        this.serviceRequestModel.status = ServiceRequestStatus.finalized;

      }

      this.markForCheck();

      this.modalRef.hide();

    });

    this.modalRef.content.onCreatedItem.pipe(takeUntil(this.ngUnSubscribe)).subscribe((x: PaymentItemModel) => {

      this.serviceRequestModel.payment.items.push(x);

      this.serviceRequestModel.payment.paid = this.serviceRequestModel.payment.items.map(y => y.paymentAmount).reduce((sum, current) => sum + current, 0);

      this.serviceRequestModel.payment.remaining = this.serviceRequestModel.payment.total - this.serviceRequestModel.payment.paid;

      if (this.serviceRequestModel.payment.remaining === 0) {

        this.serviceRequestModel.payment.status = PaymentStatus.paid;

        this.serviceRequestModel.status = ServiceRequestStatus.finalized;

      }

      this.markForCheck();

      this.modalRef.hide();

    });

    this.modalRef.content.onClose.pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.modalRef.hide();

    });

  }

  public isUserTurnInApprovalProcess(): boolean {

    const idx = this.serviceRequestModel && this.serviceRequestModel.approvals && this.serviceRequestModel.approvals.findIndex(x => x.approver.id === this.user.id);

    if (idx > -1) {

      const approval = this.serviceRequestModel.approvals[idx === 0 ? idx : idx - 1];

      if ((idx === 0 && approval.state === ApprovalState.pending) || (idx > 0 && approval.state === ApprovalState.approved && this.serviceRequestModel.approvals[idx].state == ApprovalState.pending)) {

        return true;

      }

    }

    return false;

  }

  public isUserPartOfApprovalProcess(): boolean {
    return this.serviceRequestModel && this.serviceRequestModel.approvals && this.serviceRequestModel.approvals.findIndex(x => x.approver.id === this.user.id && x.state === ApprovalState.pending) > -1;
  }

  public onReasonChanged($event: any): void {

    this.markForCheck();

  }

  public checkIfQuotationSubmitted(): boolean {

    return this.serviceRequestModel.quotations && this.serviceRequestModel.quotations.some(x => x.items && x.items.length > 0);

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
