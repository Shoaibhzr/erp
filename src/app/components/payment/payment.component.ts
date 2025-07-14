import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/** Models */
import { PagedList } from '../../models/common/paged-list';
import { QuotationModel } from '../../models/quotation-model';
import { QuotationStatus } from '../../models/quotation-status';
import { ServiceRequestModel } from '../../models/service-request-model';
import { CommentModel, CommentViewModel } from '../../models/comment-model';
import { CommentCreateRequestModel } from '../../models/request/comment-create-request-model';
import { CommentSearchRequestModel } from '../../models/request/comment-search-request-model';

/** Services */
import { CommentService } from '../../services/comment.service';
import { ContextService } from '../../services/context.service';
import { QuotationService } from '../../services/quotation.service';
import { QuotationItemModel } from '../../models/quotation-item-model';
import { InvoiceModel } from '../../models/invoice-model';
import { InvoiceStatus } from '../../models/invoice-status';
import { InvoiceItemModel } from '../../models/invoice-item-model';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentModel } from '../../models/payment-model';
import { PaymentStatus } from '../../models/payment-status';
import { PaymentMethod } from '../../models/payment-method';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentComponent implements OnInit, OnDestroy {

  private _payment: PaymentModel;

  @Input()
  public set payment(payment: PaymentModel) {

    this._payment = payment;

  }

  public get payment() {

    return this._payment;

  }

  public PaymentStatus = PaymentStatus;

  public PaymentMethod = PaymentMethod;

  @Output()
  public onCreatePaymentItem: EventEmitter<void> = new EventEmitter();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private invoiceSvc: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private contextSvc: ContextService) {

  }

  ngOnInit() {

  }

  public checkIfReferenceNumberExists(): boolean {

    return this.payment.items.some(x => x.referenceNumber != undefined);

  }

  public checkIfChequeNumberExists(): boolean {

    return this.payment.items.some(x => x.chequeNumber != undefined);

  }

  public checkIfChequeCashedDateExists(): boolean {

    return this.payment.items.some(x => x.chequeCashedDate != undefined);

  }

  public checkIfCardNumberExists(): boolean {

    return this.payment.items.some(x => x.cardNumber != undefined);

  }

  public getColSpan(): number {

    return 6 - (this.checkIfReferenceNumberExists() ? 1 : 0) - (this.checkIfChequeNumberExists() ? 1 : 0) - (this.checkIfChequeCashedDateExists() ? 1 : 0) - (this.checkIfCardNumberExists() ? 1 : 0)

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
