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
import { Helpers } from 'src/app/utils/helpers-util';

@Component({
  selector: 'quotation',
  templateUrl: './quotation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class QuotationComponent implements OnInit, OnDestroy {

  @Input()
  public serviceRequestId: string;

  public approvedQuotation: QuotationModel;

  public FileHelper = Helpers;

  private _quotations: QuotationModel[];

  @Input()
  public set quotations(quotations: QuotationModel[]) {

    this.approvedQuotation = quotations && quotations.find(x => x.status === QuotationStatus.approved);

    this._quotations = quotations;

  }

  public get quotations() {

    return this._quotations;

  }

  public isCreateInProgress: boolean;

  public expandedQuotationId: string;

  public QuotationStatus = QuotationStatus;

  @Output()
  public onInviteVendor: EventEmitter<void> = new EventEmitter();

  @Output()
  public onApproved: EventEmitter<QuotationModel> = new EventEmitter();

  @Output()
  public onRejected: EventEmitter<QuotationModel> = new EventEmitter();

  @Output()
  public onItemApproved: EventEmitter<QuotationItemModel> = new EventEmitter();

  @Output()
  public onItemRejected: EventEmitter<QuotationItemModel> = new EventEmitter();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private quotationSvc: QuotationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private contextSvc: ContextService) {

  }

  ngOnInit() {

  }

  public inviteVendor(): void {

    this.onInviteVendor.emit();

  }

  public toggle(quotation: QuotationModel): void {

    if (!quotation.items || quotation.items.length === 0) {

      return;

    }

    if (this.expandedQuotationId === quotation.id) {

      delete this.expandedQuotationId;

    }
    else {

      this.expandedQuotationId = quotation.id;

    }

    this.markForCheck();

  }

  public approve(quotation: QuotationModel): void {

    this.quotationSvc.approveAsync(quotation.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      quotation.status = QuotationStatus.approved;

      this.approvedQuotation = quotation;

      this.onApproved.emit(quotation);

      this.markForCheck();

    });

  }

  public reject(quotation: QuotationModel): void {

    this.quotationSvc.rejectAsync(quotation.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      quotation.status = QuotationStatus.rejected;

      this.onRejected.emit(quotation);

      this.markForCheck();

    });

  }

  public approveItem(quotation: QuotationModel, quotationItem: QuotationItemModel): void {

    this.quotationSvc.approveItemAsync(quotationItem.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      quotationItem.status = QuotationStatus.approved;

      this.onItemApproved.emit(quotationItem);

      this.markForCheck();

    });

  }

  public rejectItem(quotation: QuotationModel, quotationItem: QuotationItemModel): void {

    this.quotationSvc.rejectItemAsync(quotationItem.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      quotationItem.status = QuotationStatus.rejected;

      this.onItemRejected.emit(quotationItem);

      this.markForCheck();

    });

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
