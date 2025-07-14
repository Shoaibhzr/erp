import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';

/** Models */
import { CommentModel, CommentViewModel } from '../../models/comment-model';
import { PagedList } from '../../models/common/paged-list';
import { CommentSearchRequestModel } from '../../models/request/comment-search-request-model';

/** Services */
import { CommentService } from '../../services/comment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentCreateRequestModel } from '../../models/request/comment-create-request-model';
import { ContextService } from '../../services/context.service';
import { ServiceRequestType } from '../../models/service-request-type';
import { ServiceRequestModel } from '../../models/service-request-model';
import { ServiceRequestSearchRequestModel } from '../../models/request/service-request-search-request-model';
import { ServiceRequestService } from '../../services/service-request.service';
import { UserModel } from '../../models/user-model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  AllocateByOptions,
  AmountAllocatedOptions,
} from 'src/app/models/accounts-payable';
import { VendorService } from '../../services/vendor.service';
import { VendorSearchRequestModel } from '../../models/request/vendor-search-request-model';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { CategoryMinimalModel } from '../../models/category-minimal-model';
import { ExpenseCategoryModel } from '../../models/expense-category-model';
import { AccountsPayableService } from '../../services/accounts-payable.service';
import { StoreService } from '../../services/store.service';
import { StoreSearchRequestModel } from '../../models/request/store-search-request-model';
import { StoreModel } from '../../models/store-model';

@Component({
  selector: 'service-request-create',
  templateUrl: './service-request-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceRequestCreateComponent implements OnInit, OnDestroy {
  @ViewChild('allocateAmountTemplate')
  allocateAmountTemplate!: TemplateRef<any>;

  @Input()
  public id: string = null;

  public form!: FormGroup;

  public itemForm!: FormGroup;

  public minDate: Date;

  public maxDate: Date = new Date();

  public isInitInProgress: boolean;

  public isCreateRequestInProgress: boolean;

  public serviceRequestModel: ServiceRequestModel;

  public files: File[];

  public amountAllocatedOptions = AmountAllocatedOptions;

  public allocateByOptions = AllocateByOptions;

  public allocateBy: AllocateByOptions = AllocateByOptions.percentage;

  public allocatedAmount: number[] = [];

  public remainingToAllocate: number = 100;

  public vendors: UserModel[];

  public categories: ExpenseCategoryModel[];

  public items: any[] = [];

  public vendorSubsidiaries: UserModel[];

  public modalRef?: BsModalRef;

  public isTaxOnInvoice: boolean = true;

  public isUrgent: boolean = true;

  public stores: StoreModel[];

  public selectedStores: StoreModel[];

  public chartofAccountsCategories = [
    {
      id: 'c9cbb799-1442-4566-8194-73939175f064',
      companyId: '759c1cdb-6cad-48c9-8899-1ed1d9441e71',
      name: 'Default account',
    },
  ];

  public storeGroups = [
    {
      id: '251ca064-37c3-4671-901a-8ac64a4b4de4',
      companyId: '759c1cdb-6cad-48c9-8899-1ed1d9441e71',
      name: 'Default Store Group',
      storeId: 'fad28e8c-b03f-4ee0-9420-9254c10d64fb',
      type: '2',
    },
  ];

  @Output()
  public onIsInitInProgress: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public onServiceRequestModel: EventEmitter<ServiceRequestModel> =
    new EventEmitter();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private vendorSvc: VendorService,
    private accountsPayableSvc: AccountsPayableService,
    private categorySvc: ExpenseCategoryService,
    private storeSvc: StoreService,
    private fb: FormBuilder,
    private contextSvc: ContextService,
    private serviceRequestSvc: ServiceRequestService,
    private modalSvc: BsModalService
  ) {}

  ngOnInit() {
    const user = this.contextSvc.user.getValue();

    this.form = this.fb.group({
      companyId: [user.userRoles[0]?.company?.id ?? ''],
      vendorId: [null, Validators.required],
      vendorSubsidiary: [null, Validators.maxLength(50)],
      categoryId: [null, Validators.required],
      memo: ['', [Validators.minLength(3), Validators.maxLength(50)]],
      invoiceNumber: [null, [Validators.required, Validators.maxLength(50)]],
      invoiceDate: [null, [Validators.required]],
      dueDate: [null, [Validators.required]],
      invoiceAmount: [null, [Validators.required]],
      // remainingAmount: [null, [Validators.required]],
      hasTax: [false],
      isUrgent: [false],
    });

    this.itemForm = this.fb.group({
      serviceRequestId: [null],
      chartOfAccountId: [null, Validators.required],
      storeGroupId: [null, Validators.required],
      storeId: [[], Validators.required],
      description: [''],
      amount: [null, Validators.required],
      allocatedAmount: [{ value: null, disabled: true }, Validators.required],
    });

    this.itemForm.get('storeId')?.valueChanges.subscribe((value) => {
      this.checkAllocatedByField(value);
    });

    this.itemForm.get('amount')?.valueChanges.subscribe((value) => {
      this.checkAllocatedByField(value);
    });

    this.search();
  }

  public search() {
    this.isInitInProgress = true;

    this.markForCheck();

    const vendorSearchRequestModel: VendorSearchRequestModel = <
      VendorSearchRequestModel
    >{ page: 1, pageSize: 100000 };

    this.vendorSvc
      .searchAsync(vendorSearchRequestModel)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((x) => {
        this.vendors = x.items;

        this.categorySvc
          .getAsync()
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe((x) => {
            this.categories = x;

            this.chartofAccountsCategories =
              this.chartofAccountsCategories.filter(
                (x) => x.companyId === this.form.get('companyId')?.value
              );

            this.storeGroups = this.storeGroups.filter(
              (x) => x.companyId === this.form.get('companyId')?.value
            );

            const storeSearchRequestModel = new StoreSearchRequestModel();

            storeSearchRequestModel.page = 1;

            storeSearchRequestModel.pageSize = 100000;

            this.storeSvc
              .searchAsync(storeSearchRequestModel)
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe((x) => {
                this.stores = x.items;

                this.isInitInProgress = false;

                this.markForCheck();
              });
          });
      });
  }

  public onAllocateByOptChange(value: AllocateByOptions) {
    if (value === AllocateByOptions.amount) {
      this.allocatedAmount.forEach((item, index) => {
        this.allocatedAmount[index] =
          (this.itemForm.get('amount').value * item) / 100;
      });
      this.remainingToAllocate =
        (this.itemForm.get('amount').value * this.remainingToAllocate) / 100;
    } else if (value === AllocateByOptions.percentage) {
      this.allocatedAmount.forEach((item, index) => {
        this.allocatedAmount[index] =
          (item / this.itemForm.get('amount').value) * 100;
      });
      this.remainingToAllocate =
        (this.remainingToAllocate / this.itemForm.get('amount').value) * 100;
    }
  }

  public onAmountChange(allocatedAmount: number[]) {
    const sum = allocatedAmount.reduce((acc, num) => acc + num, 0);
    if (this.allocateBy === AllocateByOptions.percentage)
      this.remainingToAllocate = 100 - sum;
    else if (this.allocateBy === AllocateByOptions.amount)
      this.remainingToAllocate = this.itemForm.get('amount').value - sum;
  }

  public onInvoiceDateChange(selectedDate: Date) {
    const dueDate = this.form.get('dueDate');

    if (dueDate?.value !== null && selectedDate > new Date(dueDate.value)) {
      dueDate.setValue(null);
    }

    this.minDate = selectedDate;

    this.markForCheck();
  }

  public validateInvoiceNumber(event: any) {
    const allowedKeys = /^[a-zA-Z0-9-#]$/;
    if (!allowedKeys.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  public add(): void {
    if (this.itemForm.value.stores?.length > 1) {
      console.log('pending');
    } else {
      this.items.push(this.itemForm.value);
      this.itemForm.reset();
    }
  }

  public deleteItem(itemIndex: number) {
    this.items.splice(itemIndex, 1);
  }

  public openModal(template: TemplateRef<void>) {
    this.modalRef = this.modalSvc.show(template);
  }

  public getChartofAccountCategory(id: string) {
    return this.chartofAccountsCategories?.filter((x) => x.id === id)[0]?.name;
  }

  public getStoreGroup(id: string) {
    return this.storeGroups?.filter((x) => x.id === id)[0]?.name;
  }

  public getStore(id: string) {
    return this.stores?.filter((x) => x.id === id)[0]?.name;
  }

  public onAllocatedAmountChange(value: AmountAllocatedOptions) {
    this.allocatedAmount = [];
    this.remainingToAllocate = 100;
    this.openModal(this.allocateAmountTemplate);
    if (value === this.amountAllocatedOptions.equally) {
      this.itemForm.get('storeId').value.forEach((element: any) => {
        const storeAmount = parseFloat(
          (100 / this.itemForm.get('storeId').value.length).toFixed(2)
        );
        this.allocatedAmount.push(storeAmount);
        this.remainingToAllocate = parseFloat(
          (this.remainingToAllocate - storeAmount).toFixed(2)
        );
      });
    } else if (value === this.amountAllocatedOptions.manually)
      this.openModal(this.allocateAmountTemplate);
  }

  public selectStoreGroup(event: any) {
    const groupId = (event.target as HTMLSelectElement).value;

    this.selectedStores = this.stores?.filter(
      (x) =>
        x.id === this.storeGroups?.filter((x) => x.id === groupId)[0].storeId
    );

    this.markForCheck();
  }

  public onFilesSelected($event: any, fileUploadCtrl: any): void {
    if (!this.files) {
      this.files = [];
    }

    for (let i = 0; i < $event.target.files.length; i++) {
      const file = $event.target.files[i];

      if (!this.files.some((x) => x.name === file.name)) {
        this.files.push(file);
      }
    }

    fileUploadCtrl.value = '';

    this.markForCheck();
  }

  public removeFile(idx: number): void {
    this.files.splice(idx, 1);

    this.markForCheck();
  }

  public deleteFile(idx: number): void {
    this.serviceRequestModel.files.splice(idx, 1);

    this.markForCheck();
  }

  private markForCheck(): void {
    this.cd.markForCheck();
  }

  private checkAllocatedByField(value: any[]) {
    if ((value && value.length <= 1) || !this.itemForm.get('amount').value) {
      this.itemForm.get('allocatedAmount')?.disable();
    } else {
      this.itemForm.get('allocatedAmount')?.enable();
    }
  }

  ngOnDestroy() {
    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();
  }
}
