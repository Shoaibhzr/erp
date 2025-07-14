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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

/** Models */
import { UserModel } from '../../models/user-model';
import { PagedList } from '../../models/common/paged-list';
import { QuotationModel } from '../../models/quotation-model';
import { UserMinimalModel } from '../../models/user-minimal-model';
import { VendorSearchRequestModel } from '../../models/request/vendor-search-request-model';
import { CommentSearchRequestModel } from '../../models/request/comment-search-request-model';
import { CommentCreateRequestModel } from '../../models/request/comment-create-request-model';
import { QuotationCreateRequestModel } from '../../models/request/quotation-create-request-model';

/** Services */
import { VendorService } from '../../services/vendor.service';
import { CommentService } from '../../services/comment.service';
import { ContextService } from '../../services/context.service';
import { QuotationService } from '../../services/quotation.service';
import { ServiceRequestModel } from '../../models/service-request-model';
import { PaymentService } from '../../services/payment.service';
import { PaymentCreateRequestModel } from '../../models/request/payment-create-request-model';
import { PaymentMethod } from '../../models/payment-method';
import { PaymentModel } from '../../models/payment-model';
import { PaymentUpdateRequestModel } from '../../models/request/payment-update-request-model';
import { PaymentItemModel } from '../../models/payment-item-model';
import { PaymentItemCreateRequestModel } from '../../models/request/payment-item-create-request-model';

@Component({
  selector: 'complete-payment',
  templateUrl: './complete-payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CompletePaymentComponent implements OnInit, OnDestroy {

  @Input()
  public serviceRequest: ServiceRequestModel;

  public form: FormGroup;

  public isCreateInProgress: boolean;

  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  @Output()
  public onCreated: EventEmitter<PaymentModel> = new EventEmitter();

  @Output()
  public onCreatedItem: EventEmitter<PaymentItemModel> = new EventEmitter();

  public payment: PaymentModel;

  public PaymentMethod = PaymentMethod;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private paymentSvc: PaymentService,
    private fb: FormBuilder) {

  }

  ngOnInit() {

    if (!this.serviceRequest.payment) {

      this.payment = <PaymentModel>{ total: this.serviceRequest.invoice.total, remaining: this.serviceRequest.invoice.total };

    }
    else {

      this.payment = JSON.parse(JSON.stringify(this.serviceRequest.payment));

    }

    this.form = this.fb.group({
      id: [null],
      paymentMethod: [PaymentMethod.eCheque],
      paymentDate: [null, [Validators.required]],
      paidBy: [null, [Validators.required]],
      description: [null, [Validators.required]],
      paymentAmount: [null, [Validators.required, Validators.min(1), Validators.max(this.payment.remaining)]],
      referenceNumber: [null],
      chequeNumber: [null, [Validators.required, Validators.maxLength(500)]],
      chequeCashedDate: [null, [Validators.required]],
      cardNumber: [null]
    });

    this.markForCheck();

  }

  public close(): void {

    this.onClose.emit();

  }

  public submit(): void {
    
    if (this.serviceRequest.payment?.id) {

      this.createItem();

    }
    else {

      this.create();

    }

  }

  public createItem(): void {

    this.isCreateInProgress = true;

    this.markForCheck();

    const paymentItemCreateRequestModel: PaymentItemCreateRequestModel = this.form.getRawValue();

    paymentItemCreateRequestModel.paymentId = this.serviceRequest.payment.id

    if (paymentItemCreateRequestModel.paymentMethod === PaymentMethod.eCheque || paymentItemCreateRequestModel.paymentMethod === PaymentMethod.officeCheque) {

      paymentItemCreateRequestModel.referenceNumber = undefined;

      paymentItemCreateRequestModel.cardNumber = undefined;

    }
    else if (paymentItemCreateRequestModel.paymentMethod === PaymentMethod.ach || paymentItemCreateRequestModel.paymentMethod === PaymentMethod.portal || paymentItemCreateRequestModel.paymentMethod === PaymentMethod.wire) {

      paymentItemCreateRequestModel.cardNumber = undefined;

      paymentItemCreateRequestModel.chequeNumber = undefined;

      paymentItemCreateRequestModel.chequeCashedDate = undefined;

    }
    else if (paymentItemCreateRequestModel.paymentMethod === PaymentMethod.creditCard || paymentItemCreateRequestModel.paymentMethod === PaymentMethod.debitCard) {

      paymentItemCreateRequestModel.referenceNumber = undefined;

      paymentItemCreateRequestModel.chequeNumber = undefined;

      paymentItemCreateRequestModel.chequeCashedDate = undefined;

    }

    this.paymentSvc.createItemAsync(paymentItemCreateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(paymentItem => {

      this.onCreatedItem.next(paymentItem);

      this.markForCheck();

    });

  }

  public create(): void {
    
    this.isCreateInProgress = true;

    this.markForCheck();

    const paymentCreateRequestModel: PaymentCreateRequestModel = <PaymentCreateRequestModel>{
      serviceRequestId: this.serviceRequest.id
    };

    const paymentItem: PaymentItemModel = this.form.getRawValue();

    if (paymentItem.paymentMethod === PaymentMethod.eCheque || paymentItem.paymentMethod === PaymentMethod.officeCheque) {

      paymentItem.referenceNumber = undefined;

      paymentItem.cardNumber = undefined;

    }
    else if (paymentItem.paymentMethod === PaymentMethod.ach || paymentItem.paymentMethod === PaymentMethod.portal || paymentItem.paymentMethod === PaymentMethod.wire) {

      paymentItem.cardNumber = undefined;

      paymentItem.chequeNumber = undefined;

      paymentItem.chequeCashedDate = undefined;

    }
    else if (paymentItem.paymentMethod === PaymentMethod.creditCard || paymentItem.paymentMethod === PaymentMethod.debitCard) {

      paymentItem.referenceNumber = undefined;

      paymentItem.chequeNumber = undefined;

      paymentItem.chequeCashedDate = undefined;

    }

    paymentCreateRequestModel.items = [paymentItem];

    this.paymentSvc.createAsync(paymentCreateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(payment => {

      this.onCreated.next(payment);

      this.markForCheck();

    });

  }

  public onPaymentMethodChange($event: any): void {

    this.form.get("referenceNumber").setValidators([]);

    this.form.get("referenceNumber").updateValueAndValidity();

    this.form.get("chequeNumber").setValidators([]);

    this.form.get("chequeNumber").updateValueAndValidity();

    this.form.get("chequeCashedDate").setValidators([]);

    this.form.get("chequeCashedDate").updateValueAndValidity();

    this.form.get("cardNumber").setValidators([]);

    this.form.get("cardNumber").updateValueAndValidity();
    
    const paymentMethod: PaymentMethod = this.form.get("paymentMethod").value;

    if ([PaymentMethod.ach, PaymentMethod.portal, PaymentMethod.wire].some(x => x === paymentMethod)) {

      this.form.get("referenceNumber").setValidators([Validators.required, Validators.maxLength(500)]);

      this.form.get("referenceNumber").updateValueAndValidity();

      this.form.get("referenceNumber").reset();

    }
    else if ([PaymentMethod.creditCard, PaymentMethod.debitCard].some(x => x === paymentMethod)) {

      this.form.get("cardNumber").setValidators([Validators.required, Validators.maxLength(500)]);

      this.form.get("cardNumber").updateValueAndValidity();

      this.form.get("cardNumber").reset();

    }
    else if ([PaymentMethod.eCheque, PaymentMethod.officeCheque].some(x => x === paymentMethod)) {

      this.form.get("chequeNumber").setValidators([Validators.required, Validators.maxLength(500)]);

      this.form.get("chequeNumber").updateValueAndValidity();

      this.form.get("chequeNumber").reset();

      this.form.get("chequeCashedDate").setValidators([Validators.required]);

      this.form.get("chequeCashedDate").updateValueAndValidity();

      this.form.get("chequeCashedDate").reset();

    }

    this.markForCheck();

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
