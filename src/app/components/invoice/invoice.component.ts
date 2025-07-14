import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
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
import { ServiceRequestType } from 'src/app/models/service-request-type';
import { FileModel } from 'src/app/models/file-model';
import { Helpers } from 'src/app/utils/helpers-util';
import { CompanyService } from '../../services/company.service';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';
import { StoreService } from '../../services/store.service';
import { StoreSearchRequestModel } from '../../models/request/store-search-request-model';
import { CompanyModel } from '../../models/company-model';
import { StoreModel } from '../../models/store-model';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AttachmentsListComponent } from '../attachments-list/attachments-list.component';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { ExpenseCategoryModel } from 'src/app/models/expense-category-model';

@Component({
  selector: 'invoice',
  templateUrl: './invoice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoiceComponent implements OnInit, OnDestroy {

  @Input() invoiceType: ServiceRequestType = ServiceRequestType.expense;

  serviceRequestType = ServiceRequestType;

  public approvedInvoice: InvoiceModel;

  public FileHelper = Helpers;

  private _invoice: InvoiceModel;

  @Input()
  public set invoice(invoice: InvoiceModel) {

    this._invoice = invoice;

  }

  public get invoice() {

    return this._invoice;

  }

  public isCreateInProgress: boolean;

  public InvoiceStatus = InvoiceStatus;

  @Output()
  public onApproved: EventEmitter<void> = new EventEmitter();

  @Output()
  public onRejected: EventEmitter<void> = new EventEmitter();

  @Output()
  public onItemApproved: EventEmitter<InvoiceItemModel> = new EventEmitter();

  @Output()
  public onItemRejected: EventEmitter<InvoiceItemModel> = new EventEmitter();

  public companies: CompanyModel[];

  public modalRef?: BsModalRef;

  public stores: StoreModel[];

  public categories: ExpenseCategoryModel[];

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  expandedStores: { [key: string]: boolean } = {};

  constructor(
    private cd: ChangeDetectorRef,
    private invoiceSvc: InvoiceService,
    private companySvc: CompanyService,
    private storeSvc: StoreService,
    private modalSvc: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private contextSvc: ContextService, 
   private expenseCategorySvc: ExpenseCategoryService,) {

  }

  ngOnInit() {
  const companySearchRequestModel = new CompanySearchRequestModel();
  companySearchRequestModel.page = 1;
  companySearchRequestModel.pageSize = 100000;
  companySearchRequestModel.ids = [...new Set(this.invoice.items.map(x => x.companyId))];

  const storeSearchRequestModel = new StoreSearchRequestModel();
  storeSearchRequestModel.page = 1;
  storeSearchRequestModel.pageSize = 100000;
  storeSearchRequestModel.ids = [...new Set(this.invoice.items.flatMap(x => x.storeIds))];

  const company$ = this.companySvc.searchAsync(companySearchRequestModel);
  const store$ = this.storeSvc.searchAsync(storeSearchRequestModel);
  const category$ = this.expenseCategorySvc.getAsync();

  forkJoin([company$, store$, category$])
    .pipe(takeUntil(this.ngUnSubscribe))
    .subscribe(([companyResult, storeResult, categoryResult]) => {
      this.companies = companyResult.items;
      this.stores = storeResult.items;
      this.categories = categoryResult;

      this.markForCheck();
    });
}

  public getFiles() {
    if(this.invoiceType === ServiceRequestType.repairAndMainenance) {
      return this.invoice.files
    } else {
      const files: FileModel[] = [];
      this.invoice.items.forEach((item: InvoiceItemModel) => {
        files.push(...item.files);
      })
      return files;
    }
  }

  public openModal(files: FileModel[]) {

    const initialState: ModalOptions = {
      initialState: {
        files: files
      },
      class: 'modal-body',
      ignoreBackdropClick: true
    };

    this.modalRef = this.modalSvc.show(AttachmentsListComponent, initialState);

    this.modalRef.content.onClosed.pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.modalRef.hide();

    });

  }

  public getItemCompany(id: string): string {
    return this.companies?.find(x => x.id === id)?.name;
  }

  public getItemCategory(id: string): string {
    return this.categories?.find(x => x.id === id)?.name;
  }

  public getItemStore(item: any): any {
  const storeId = item.stores[0].id;
  return this.stores?.find(x => x.id === storeId)?.name;
}

toggleStores(item: any, event: MouseEvent): void {
  event.preventDefault();
  const key = this.getItemKey(item);
  this.expandedStores[key] = !this.expandedStores[key];
}

isExpanded(item: any): boolean {
  return this.expandedStores[this.getItemKey(item)];
}

getVisibleStores(item: any): any[] {
  const isExpanded = this.isExpanded(item);
  return isExpanded ? item.stores : item.stores.slice(0, 2);
}

// Assumes you have a unique identifier for each item
getItemKey(item: any): string {
  return item.id?.toString() ?? JSON.stringify(item); // customize as needed
}


  public approve(invoice: InvoiceModel): void {

    this.invoiceSvc.approveAsync(invoice.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      invoice.status = InvoiceStatus.approved;

      this.onApproved.emit();

      this.markForCheck();

    });

  }

  public reject(invoice: InvoiceModel): void {

    this.invoiceSvc.rejectAsync(invoice.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      invoice.status = InvoiceStatus.rejected;

      this.onRejected.emit();

      this.markForCheck();

    });

  }

  public approveItem(invoiceItem: InvoiceItemModel): void {

    this.invoiceSvc.approveItemAsync(invoiceItem.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      invoiceItem.status = InvoiceStatus.approved;

      this.onItemApproved.emit(invoiceItem);

      this.markForCheck();

    });

  }

  public rejectItem(invoiceItem: InvoiceItemModel): void {

    this.invoiceSvc.rejectItemAsync(invoiceItem.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      invoiceItem.status = InvoiceStatus.rejected;

      this.onItemRejected.emit(invoiceItem);

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
