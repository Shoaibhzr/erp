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
import { ServiceRequestPriority } from '../../models/service-request-priority';
import { ServiceRequestStatus } from '../../models/service-request-status';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'invite-vendor',
  templateUrl: './invite-vendor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class InviteVendorComponent implements OnInit, OnDestroy {

  @Input()
  public serviceRequestId: string;

  @Input()
  public serviceRequestModel: ServiceRequestModel;

  @Input()
  public quotations: QuotationModel[];

  public vendorsPagedList: PagedList<UserModel>;

  public isVendorExpanded: string;

  public isInitInProgress: boolean;

  public isCreateInProgress: boolean;

  public selectedVendorIds: string[];

  public ServiceRequestPriority = ServiceRequestPriority;

  public searchTerm: string;

  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  @Output()
  public onCreated: EventEmitter<QuotationModel[]> = new EventEmitter();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private vendorSvc: VendorService,
    private quotationSvc: QuotationService,
    private fb: FormBuilder,
    private datePipe: DatePipe) {

  }

  ngOnInit() {

    this.isInitInProgress = true;

    this.markForCheck();

    const vendorSearchRequestModel: VendorSearchRequestModel = <VendorSearchRequestModel>{ page: 1, pageSize: 100000 };

    if (this.quotations && this.quotations.length > 0) {

      vendorSearchRequestModel.excludeIds = this.quotations.map(x => x.vendor.id);

    }

    this.vendorSvc.searchAsync(vendorSearchRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe((x) => {

      this.vendorsPagedList = x;

      this.isInitInProgress = false;

      this.markForCheck();

    });

  }

  public toggleReviews(userId: string): void {

    if (this.isVendorExpanded === userId) {

      delete this.isVendorExpanded;

    }
    else {

      this.isVendorExpanded = userId;

    }

    this.markForCheck();

  }

  public close(): void {

    this.onClose.emit();

  }

  public select(vendorId: string): void {

    if (this.serviceRequestModel.priority === ServiceRequestPriority.emergency) {

      this.selectedVendorIds = [vendorId];

    }
    else {

      if (!this.selectedVendorIds) {

        this.selectedVendorIds = [];

      }

      const idx: number = this.selectedVendorIds.findIndex(x => x === vendorId);

      if (idx > -1) {

        this.selectedVendorIds.splice(idx, 1);

      }
      else {

        this.selectedVendorIds.push(vendorId);

      }

    }

    this.markForCheck();

  }

  public isSelected(vendorId: string): boolean {

    return this.selectedVendorIds && this.selectedVendorIds.some(x => x === vendorId);

  }

  public invite(): void {

    this.isCreateInProgress = true;

    this.markForCheck();

    const forkJoinInput: any[] = this.selectedVendorIds.map(x => this.quotationSvc.createAsync(<QuotationCreateRequestModel>{ serviceRequestId: this.serviceRequestId, vendorId: x }));

    forkJoin(forkJoinInput).pipe(takeUntil(this.ngUnSubscribe)).subscribe(quotationModels => {

      quotationModels.forEach((q: QuotationModel) => {

        const vendor = this.vendorsPagedList.items.find(i => i.id === q.vendor.id);

        q.vendor = <UserMinimalModel>{ id: vendor.id, firstName: vendor.firstName, lastName: vendor.lastName, profilePictureWebUrl: vendor.profilePictureWebUrl };

      });

      if (this.serviceRequestModel.priority === ServiceRequestPriority.emergency) {

        this.serviceRequestModel.vendorId = this.selectedVendorIds[0];

        this.serviceRequestModel.status = ServiceRequestStatus.vendorAssigned;

        this.serviceRequestModel.vendor = this.vendorsPagedList.items.find(x => x.id === this.serviceRequestModel.vendorId);

      }

      this.onCreated.emit(quotationModels);

      this.markForCheck();

    });

  }

  filteredData() {
    if (!this.searchTerm) {
      return this.vendorsPagedList.items; // If no search term, return all data
    }

    return this.vendorsPagedList.items.filter(row =>
      row.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.lastName?.toString().includes(this.searchTerm) ||
      row.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.datePipe.transform(row?.createdOn, 'MMM d, y, h:mm a').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
