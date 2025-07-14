import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';

/** Services */
import { ServiceRequestModel } from '../../models/service-request-model';
import { ServiceRequestService } from '../../services/service-request.service';
import { ServiceRequestSearchRequestModel } from '../../models/request/service-request-search-request-model';
import { ServiceRequestPriority } from '../../models/service-request-priority';
import { ServiceRequestStatus } from '../../models/service-request-status';
import { ApprovalState } from '../../models/approval-state';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { UserModel } from '../../models/user-model';
import { ContextService } from '../../services/context.service';
import { ApprovalModel } from '../../models/approval-model';
import { UserMinimalModel } from '../../models/user-minimal-model';
import { InviteVendorComponent } from '../../components/invite-vendor/invite-vendor.component';
import { CompletePaymentComponent } from '../../components/complete-payment/complete-payment.component';
import { QuotationModel } from 'src/app/models/quotation-model';
import { ServiceRequestTab } from 'src/app/models/service-request-tab';
import { QuotationStatus } from 'src/app/models/quotation-status';
import { QuotationFileModel } from '../../models/quotation-file-model';
import { QuotationFileType } from '../../models/quotation-file-type';
import { InvoiceStatus } from '../../models/invoice-status';
import { QuotationService } from '../../services/quotation.service';
import { QuotationItemModel } from '../../models/quotation-item-model';
import { InvoiceModel } from '../../models/invoice-model';
import { PaymentModel } from '../../models/payment-model';
import { PaymentItemModel } from '../../models/payment-item-model';
import { PaymentStatus } from '../../models/payment-status';
import { Helpers } from 'src/app/utils/helpers-util';

@Component({
  selector: 'repair-and-maintenance-detail-view',
  templateUrl: './repair-and-maintenance-detail-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RepairAndMaintenanceDetailViewPage implements OnInit, OnDestroy {

  public id: string;

  public isInitInProgress: boolean;

  public isActionInProgress: boolean;

  public serviceRequestModel: ServiceRequestModel;

  public modalRef?: BsModalRef;

  public user: UserModel;

  public approval: ApprovalModel;

  public selectedTab: ServiceRequestTab = ServiceRequestTab.overview;

  public expandedQuotationId: string;

  public approvedQuotation: QuotationModel;

  public approvedQuotationFile: QuotationFileModel;

  public QuotationStatus = QuotationStatus;

  public InvoiceStatus = InvoiceStatus;

  public ServiceRequestTab = ServiceRequestTab;

  public ApprovalState = ApprovalState;

  public ServiceRequestStatus = ServiceRequestStatus;

  public ServiceRequestPriority = ServiceRequestPriority;

  public FileHelper = Helpers;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private serviceRequestSvc: ServiceRequestService,
    private quotationSvc: QuotationService,
    private modalSvc: BsModalService,
    private contextSvc: ContextService,
    private router: Router,
    private route: ActivatedRoute) {

  }

  ngOnInit() {

    this.user = this.contextSvc.user.getValue();

    this.search();

  }

  public search() {

    this.isInitInProgress = true;

    this.markForCheck();

    new Observable<void>(observer => {

      this.id = this.route.snapshot.params["id"];

      if (this.id) {

        this.serviceRequestSvc.getByIdAsync(this.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

          (x) => {

            this.serviceRequestModel = x;

            if (this.serviceRequestModel.status === ServiceRequestStatus.rejected) {

              this.approval = this.serviceRequestModel.approvals.find(x => x.state === ApprovalState.rejected);

            }
            else if (this.serviceRequestModel.status === ServiceRequestStatus.returned) {

              this.approval = this.serviceRequestModel.approvals.find(x => x.state === ApprovalState.returned);

            }
            else {

              this.approval = this.serviceRequestModel.approvals.find(x => x.state === ApprovalState.approved);

            }

            if (this.serviceRequestModel.quotations && this.serviceRequestModel.quotations.length > 0) {

              this.approvedQuotation = this.serviceRequestModel.quotations.find(x => x.status === QuotationStatus.approved);

              if (this.approvedQuotation && this.approvedQuotation.files) {

                this.approvedQuotationFile = this.approvedQuotation.files[0];

              }

            }

            observer.next(null);

            observer.complete();

          },
          (error) => {

            observer.error(error);

          }
        );

      }
      else {

        observer.next(null);

        observer.complete();

      }

    }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

      () => {

        this.isInitInProgress = false;

        this.markForCheck();

      },
      () => {

        this.isInitInProgress = false;

        this.markForCheck();

      }

    );

  }

  public openModal(template: TemplateRef<void>) {

    this.modalRef = this.modalSvc.show(template);

  }

  public approve(): void {

    this.isActionInProgress = true;

    this.markForCheck();

    this.serviceRequestSvc.approveAsync(this.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.isActionInProgress = false;

      this.approval = this.serviceRequestModel.approvals.find(x => x.approver.id === this.user.id);

      this.approval.state = ApprovalState.approved;

      if (this.serviceRequestModel.priority === ServiceRequestPriority.emergency || this.serviceRequestModel.approvals[this.serviceRequestModel.approvals.length - 1].state === ApprovalState.approved) {

        this.serviceRequestModel.status = ServiceRequestStatus.approved;

        this.serviceRequestModel.approvedBy = <UserMinimalModel>{ id: this.user.id, firstName: this.user.firstName, lastName: this.user.lastName, profilePictureWebUrl: this.user.profilePictureWebUrl };

      }

      this.search();

      this.modalRef.hide();

      this.markForCheck();

    });

  }

  public reject(reason: string): void {

    this.isActionInProgress = true;

    this.markForCheck();

    this.serviceRequestSvc.rejectAsync(this.id, reason).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.isActionInProgress = false;

      this.serviceRequestModel.status = ServiceRequestStatus.rejected;

      this.approval = this.serviceRequestModel.approvals.find(x => x.approver.id === this.user.id);

      this.approval.reason = reason;

      this.approval.state = ApprovalState.rejected;

      this.search();

      this.modalRef.hide();

      this.markForCheck();

    });

  }

  public return(reason: string): void {

    this.isActionInProgress = true;

    this.markForCheck();

    this.serviceRequestSvc.returnAsync(this.id, reason).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.isActionInProgress = false;

      this.serviceRequestModel.status = ServiceRequestStatus.returned;

      this.approval = this.serviceRequestModel.approvals.find(x => x.approver.id === this.user.id);

      this.approval.reason = reason;

      this.approval.state = ApprovalState.returned;

      this.search();

      this.modalRef.hide();

      this.markForCheck();

    });

  }

  public inviteVendor(): void {

    const initialState: ModalOptions = {
      class: "modal-lg",
      initialState: {
        serviceRequestId: this.id,
        serviceRequestModel: this.serviceRequestModel,
        quotations: this.serviceRequestModel.quotations
      }
    };

    this.modalRef = this.modalSvc.show(InviteVendorComponent, initialState);

    this.modalRef.content.onCreated.pipe(takeUntil(this.ngUnSubscribe)).subscribe((x: QuotationModel[]) => {

      if (!this.serviceRequestModel.quotations) {

        this.serviceRequestModel.quotations = [];

      }

      this.serviceRequestModel.quotations.unshift(...x);

      this.markForCheck();

      this.modalRef.hide();

    });

    this.modalRef.content.onClose.pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.modalRef.hide();

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

  public onReasonChanged($event: any): void {

    this.markForCheck();

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

  public getCurrentApprovalUserName(): string {

    const user = this.serviceRequestModel.approvals.find(x => x.state == ApprovalState.pending);

    return `${user.approver.firstName} ${user.approver.lastName}`;

  }

  public checkIfQuotationSubmitted(): boolean {

    return this.serviceRequestModel.quotations && this.serviceRequestModel.quotations.some(x => x.items && x.items.length > 0);

  }

  public checkIfQuotationsDisabled(): boolean {

    return [
      ServiceRequestStatus.pendingApproval,
      ServiceRequestStatus.approved,
      ServiceRequestStatus.rejected,
      ServiceRequestStatus.returned,
      ServiceRequestStatus.withdrawn].findIndex(x => x === this.serviceRequestModel.status) > -1;

  }

  public checkIfInvoicesDisabled(): boolean {

    return [
      ServiceRequestStatus.pendingApproval,
      ServiceRequestStatus.approved,
      ServiceRequestStatus.rejected,
      ServiceRequestStatus.returned,
      ServiceRequestStatus.withdrawn,
      ServiceRequestStatus.quotationRequested,
      ServiceRequestStatus.vendorAssigned,
      ServiceRequestStatus.inProgress,
      ServiceRequestStatus.issueResolved].findIndex(x => x === this.serviceRequestModel.status) > -1;

  }

  public checkIfPaymentsDisabled(): boolean {
    
    return [
      ServiceRequestStatus.pendingApproval,
      ServiceRequestStatus.approved,
      ServiceRequestStatus.rejected,
      ServiceRequestStatus.returned,
      ServiceRequestStatus.withdrawn,
      ServiceRequestStatus.quotationRequested,
      ServiceRequestStatus.vendorAssigned,
      ServiceRequestStatus.inProgress,
      ServiceRequestStatus.issueResolved,
      ServiceRequestStatus.awaitingInvoiceApproval,
      ServiceRequestStatus.invoiceRejected].findIndex(x => x === this.serviceRequestModel.status) > -1 || !this.serviceRequestModel.payment;

  }

  public onQuotationApproved(quotation: QuotationModel): void {

    this.serviceRequestModel.vendorId = quotation.vendor.id;

    this.serviceRequestModel.status = ServiceRequestStatus.vendorAssigned;

    this.approvedQuotation = quotation;

    if (quotation.files && quotation.files.length > 0) {

      this.approvedQuotationFile = quotation.files[0];

    }

    this.markForCheck();

  }

  public onInvoiceApproved(): void {

    this.serviceRequestModel.invoice.status = InvoiceStatus.approved;

    this.serviceRequestModel.status = ServiceRequestStatus.paymentPending;

    this.markForCheck();

  }

  public onInvoiceRejected(): void {

    this.serviceRequestModel.status = ServiceRequestStatus.invoiceRejected;

    this.markForCheck();

  }

  public downloadFile(url: string, fileName: string) {
    Helpers.downloadFile(url, fileName)
  }
  

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
