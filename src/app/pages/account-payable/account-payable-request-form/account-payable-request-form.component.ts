import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  map,
  BehaviorSubject,
  finalize,
  debounceTime,
  switchMap,
  filter,
  tap,
  combineLatest,
  startWith,
  of,
  take,
  Observable,
  catchError,
  from,
  mergeMap,
} from 'rxjs';
import {
  AccountsPayableReadModel,
  AccountsPayableReadModelItem,
  AccountsPayableWriteModel,
  AllocateByOptions,
  AmountAllocatedOptions,
  CoaCategory,
  Store,
  VendorSubsidiary,
} from 'src/app/models/accounts-payable';
import { Category } from 'src/app/models/category';
import { Vendor } from 'src/app/models/vendor';
import { AccountsPayableService } from 'src/app/services/accounts-payable.service';
import { ContextService } from 'src/app/services/context.service';
import { SearchService } from 'src/app/services/search.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StoreGroup } from 'src/app/models/response/store-groups';
import { FileModel } from 'src/app/models/file-model';
import { ServiceRequestStatus } from 'src/app/models/service-request-status';
import { RoleConstant } from 'src/app/models/role-constant';
import { Helpers } from 'src/app/utils/helpers-util';

interface IsLoading {
  vendor: boolean;
  subsidiary: boolean;
  category: boolean;
  storeGroup: boolean;
  store: boolean;
  coa: boolean;
}

interface Item {
  id?: string;
  coa: CoaCategory;
  storeGroup: StoreGroup[];
  store: Store[];
  allocatedAmount: number;
}

@UntilDestroy()
@Component({
  selector: 'app-account-payable-request-form',
  templateUrl: './account-payable-request-form.component.html',
  styleUrls: ['./account-payable-request-form.component.scss'],
})
export class AccountPayableRequestFormComponent implements OnChanges {
  @ViewChild('allocateAmountTemplate')
  allocateAmountTemplate!: TemplateRef<void>;
  @ViewChild('confirmModal')
  confirmModal!: TemplateRef<void>;
  @Input() details: AccountsPayableReadModel;
  @Output() onEmit = new EventEmitter<AccountsPayableWriteModel>();
  form = this.fb.group({
    vendorId: this.fb.control<string | null>(null, Validators.required),
    vendorSubsidiary: this.fb.control<string | null>(
      { value: null, disabled: true },
      [Validators.required]
    ),
    categoryId: this.fb.control<string | null>(null),
    memo: this.fb.control<string | null>(null, [
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    invoiceNumber: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.maxLength(50),
    ]),
    invoiceDate: this.fb.control<Date | null>(null, [Validators.required]),
    dueDate: this.fb.control<Date | null>(null, [Validators.required]),
    invoiceAmount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(9999999999),
      this.invoiceAmountValidator(),
    ]),
    remainingAmount: this.fb.control<number | null>(
      { value: null, disabled: true },
      [Validators.required]
    ),
    hasTax: this.fb.control<boolean | null>(false),
    isUrgent: this.fb.control<boolean | null>(false),
    accountPayableDetailId: this.fb.control<string | null>(''),
    id: this.fb.control<string | null>(''),
  });
  itemForm = this.fb.group({
    chartOfAccountId: this.fb.control<CoaCategory | null>(
      null,
      Validators.required
    ),
    storeGroupId: this.fb.control<StoreGroup[]>([], Validators.required),
    storeId: this.fb.control<Store[]>([], Validators.required),
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      this.amountValidator(),
    ]),
    allocateAmount: this.fb.control<string | null>(
      { value: null, disabled: true },
      Validators.required
    ),
    id: [null],
  });
  allocateAmountFormArray = this.fb.array<
    FormGroup<{
      store: FormControl<Store>;
      amount: FormControl<number>;
    }>
  >([]);
  allocatedByControl = this.fb.control<AllocateByOptions>(
    AllocateByOptions.percentage
  );
  readonly allocateByOptions = AllocateByOptions;
  remainingAmountToAllocate = 0;
  minDate: Date;
  maxDate: Date = new Date();
  files: Array<File | FileModel> = [];
  uploadStatusMap: {
    [fileName: string]: { uploading: boolean; error: boolean };
  } = {};
  fileHelper = Helpers;
  readonly serviceRequestStatus = ServiceRequestStatus;
  readonly amountAllocatedOptions = AmountAllocatedOptions;
  readonly allocateAmountOptions = [
    this.amountAllocatedOptions.equally,
    this.amountAllocatedOptions.manually,
  ];
  items: Item[] = [];
  modalRef?: BsModalRef;
  vendorSubsidiaryPatchedOnce = false;
  disableUpdate = false;
  isLoading$ = new BehaviorSubject<IsLoading>({
    vendor: true,
    subsidiary: false,
    category: false,
    storeGroup: true,
    store: false,
    coa: true,
  });
  vendors$ = this.searchSvc
    .searchAsync<Vendor>({ page: 1, pageSize: 1000 }, 'vendor')
    .pipe(
      map((data) => data.items),
      finalize(() =>
        this.isLoading$.next({ ...this.isLoading$.value, vendor: false })
      )
    );
  vendorSubsidiary$: Observable<VendorSubsidiary[]> = this.form.controls[
    'vendorId'
  ].valueChanges.pipe(
    debounceTime(300),
    tap((value: string | null) => {
      const control = this.form.controls['vendorSubsidiary'];
      this.isLoading$.next({
        ...this.isLoading$.value,
        subsidiary: !!value,
      });
      control.reset();
      value ? control.enable() : control.disable();
    }),
    switchMap((value) => {
      if (!value) {
        return of([]);
      }

      return this.apSvc.getVendorSubsidiary(value).pipe(
        tap(() => {
          if (this.details && !this.vendorSubsidiaryPatchedOnce) {
            this.form.controls['vendorSubsidiary'].setValue(
              this.details.vendorSubsidiary.id
            );
            this.vendorSubsidiaryPatchedOnce = true;
          }
        }),
        finalize(() =>
          this.isLoading$.next({
            ...this.isLoading$.value,
            subsidiary: false,
          })
        )
      );
    })
  );
  // categories$ = this.searchSvc
  //   .searchAsync<Category>({ page: 1, pageSize: 1000 }, 'category')
  //   .pipe(
  //     map((data) => data.items),
  //     finalize(() =>
  //       this.isLoading$.next({ ...this.isLoading$.value, category: false })
  //     )
  //   );
  coaCategories$ = this.apSvc
    .getCoaCateogry()
    .pipe(
      finalize(() =>
        this.isLoading$.next({ ...this.isLoading$.value, coa: false })
      )
    );
  storeGroups$ = this.apSvc
    .getStoreGroups(
      this.contextSvc.user.value?.userRoles?.[0]?.company?.id ?? ''
    )
    .pipe(
      finalize(() =>
        this.isLoading$.next({ ...this.isLoading$.value, storeGroup: false })
      )
    );
  stores$: Observable<Store[]> = this.itemForm.controls[
    'storeGroupId'
  ].valueChanges.pipe(
    debounceTime(300),
    tap((value: Array<StoreGroup>) => {
      this.isLoading$.next({
        ...this.isLoading$.value,
        store: !!(value && value.length),
      });
      this.itemForm.controls['storeId'].reset();
    }),
    switchMap((value) => {
      if (!value || value.length === 0) {
        return of([]);
      }

      return this.apSvc.getStores(value.map(({ id }) => id)).pipe(
        map((arr) => {
          const seen = new Set();
          return arr.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        }),
        finalize(() =>
          this.isLoading$.next({ ...this.isLoading$.value, store: false })
        )
      );
    })
  );
  reCalculate$ = new BehaviorSubject<boolean>(false);
  constructor(
    private fb: FormBuilder,
    private searchSvc: SearchService,
    private contextSvc: ContextService,
    private apSvc: AccountsPayableService,
    private modalSvc: BsModalService
  ) {
    //calculate remaining amount and udpdate amount controls validity
    combineLatest([
      this.invoiceAmountControl.valueChanges.pipe(startWith(0)),
      this.totalAmountControl.valueChanges.pipe(startWith(0)),
      this.reCalculate$,
    ])
      .pipe(
        debounceTime(50),
        untilDestroyed(this),
        tap(([invoice, total]) => {
          const itemsTotal = this.items.reduce(
            (acc, item) => acc + item.allocatedAmount,
            0
          );
          const remainingAmount =
            (total ? invoice - total : invoice) - itemsTotal;
          this.remainingAmountControl.setValue(
            Number(remainingAmount.toFixed(2)) ?? null
          );

          this.invoiceAmountControl.updateValueAndValidity({
            emitEvent: false,
          });
          this.totalAmountControl.updateValueAndValidity({
            emitEvent: false,
          });
        })
      )
      .subscribe();

    //Recalculate allocate amount when store selection happens
    this.itemForm.controls['storeId'].valueChanges
      .pipe(debounceTime(50), untilDestroyed(this))
      .subscribe((value) => {
        if (value) {
          const control = this.allocateAmountControl;
          control.reset();
          if (value.length > 1) {
            control.addValidators(Validators.required);
            control.enable();
          } else {
            control.removeValidators(Validators.required);
            control.disable();
          }

          this.allocateAmountFormArray.clear();
          (value || []).forEach((item) => {
            const group = this.fb.group({
              store: [item],
              amount: [
                0,
                [
                  Validators.required,
                  Validators.min(0),
                  this.allocatedAmountValidator(),
                ],
              ],
            });
            this.allocateAmountFormArray.push(group);
          });
        }
      });

    //Reset allocate amount if amount changes
    this.itemForm.controls['amount'].valueChanges
      .pipe(debounceTime(200), untilDestroyed(this))
      .subscribe(() => this.allocateAmountControl.reset());

    this.allocateAmountControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        if (value) {
          this.allocateAmount();
          this.modalRef = this.modalSvc.show(this.allocateAmountTemplate, {
            class: 'modal-dialog-centered',
            ignoreBackdropClick: true,
          });
        }
      });

    //calculate allocate by amount or percentage
    this.allocatedByControl.valueChanges
      .pipe(debounceTime(50), untilDestroyed(this))
      .subscribe(() => {
        this.allocateAmount();
      });
  }

  invoiceAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const total =
        (this.items || []).reduce(
          (acc, item) => acc + item.allocatedAmount,
          0
        ) + this.totalAmountControl?.value || 0;

      if (!total || !value) {
        return null;
      }

      if (value < total) {
        return {
          custom: `This field should not be less than ${total}`,
        };
      }

      return null;
    };
  }

  amountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }
      const invoiceAmount = this.invoiceAmountControl?.value || 0;

      if (!invoiceAmount) {
        return {
          custom: `Invoice amount is not provided`,
        };
      }

      const remainingAmount: number = this.remainingAmountControl.value || 0;

      if (remainingAmount < 0) {
        const total = (this.items || []).reduce(
          (acc, item) => acc + item.allocatedAmount,
          0
        );
        return {
          custom: `This field should not exceed ${Number(
            invoiceAmount - total
          ).toFixed(2)}`,
        };
      }
      return null;
    };
  }

  allocatedAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || 0;
      const parentGroup = control?.parent as FormGroup<{
        store: FormControl<StoreGroup>;
        amount: FormControl<number>;
      }>;
      if (!parentGroup) return null;

      const currentStore = parentGroup.controls['store'].value;
      const totalAmount = this.totalAmountControl?.value || 0;
      const allocationMode = this.allocatedByControl.value;
      const isPercentage = allocationMode === AllocateByOptions.percentage;

      // Calculate already allocated (excluding current store)
      const allocatedSoFar = (this.allocateAmountFormArray.value || [])
        .filter((item) => item.store.id !== currentStore.id)
        .reduce((acc, item) => acc + (item.amount || 0), 0);

      if (isPercentage) {
        const remainingPercentage = 100 - allocatedSoFar;
        const currentAmount = (value / 100) * totalAmount;
        const alreadyAllocatedAmount = (allocatedSoFar / 100) * totalAmount;

        this.remainingAmountToAllocate = Number(
          (totalAmount - (currentAmount + alreadyAllocatedAmount)).toFixed(2)
        );

        if (value > remainingPercentage) {
          return {
            custom: `This field should not exceed ${Number(
              remainingPercentage.toFixed(2)
            )}%`,
          };
        }
      } else {
        this.remainingAmountToAllocate = Number(
          (totalAmount - (value + allocatedSoFar)).toFixed(2)
        );
        if (this.remainingAmountToAllocate < 0) {
          return {
            custom: `This field should not exceed ${
              value - Math.abs(this.remainingAmountToAllocate)
            }`,
          };
        }
      }

      return null;
    };
  }

  trackByIndex(index: number, _: any): number {
    return index;
  }

  // trackByCategoryId(index: number, vendor: Category): string {
  //   return vendor.id;
  // }

  get invoiceAmountControl() {
    return this.form?.controls['invoiceAmount'];
  }

  get totalAmountControl() {
    return this.itemForm?.controls['amount'];
  }

  get remainingAmountControl() {
    return this.form?.controls['remainingAmount'];
  }
  get allocateAmountControl() {
    return this.itemForm.controls['allocateAmount'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details']?.currentValue) {
      const { files, items, vendorSubsidiary, ...rest } = this.details;
      this.form.patchValue({
        id: rest?.id,
        vendorId: rest?.vendor?.id,
        memo: rest?.memo,
        invoiceNumber: rest?.accountsPayableDetails?.invoiceNumber,
        invoiceDate: new Date(rest?.accountsPayableDetails?.invoiceDate),
        categoryId: rest?.category?.id,
        dueDate: new Date(rest?.dueDate),
        invoiceAmount: rest?.accountsPayableDetails?.invoiceAmount,
        remainingAmount: rest?.accountsPayableDetails?.remainingAmount,
        accountPayableDetailId: rest?.accountsPayableDetails?.id,
        hasTax: rest?.hasTax || false,
        isUrgent: rest?.isUrgent || false,
      });
      this.files = (files || []) as FileModel[];
      this.items = (items || []).map(
        (item: AccountsPayableReadModelItem) =>
          ({
            id: item.id,
            coa: item.chartOfAccount,
            storeGroup: [item.storeGroup],
            store: [item.store],
            allocatedAmount: item.amount,
          } as Item)
      );

      if (this.details.status !== this.serviceRequestStatus.pendingApproval) {
        this.disableUpdate = true;
      }

      this.contextSvc.isAPCreator$
        .pipe(
          take(1),
          tap((isCreator) => {
            if (isCreator) {
              if (this.details.status === this.serviceRequestStatus.returned) {
                this.disableUpdate = false;
              }

              if (
                this.details.status ===
                  this.serviceRequestStatus.pendingApproval &&
                this.details.approvals.find(
                  (item) => item.state === this.serviceRequestStatus.approved
                )
              ) {
                this.disableUpdate = true;
              }
            }
          })
        )
        .subscribe();

      this.contextSvc.isAPManger1$
        .pipe(
          take(1),
          tap((isAp1) => {
            if (
              isAp1 &&
              this.details.approvals.find(
                (item) => item.approver.id === this.contextSvc.user.value.id
              )?.state === this.serviceRequestStatus.approved
            ) {
              this.disableUpdate = true;
            }
          })
        )
        .subscribe();

      this.contextSvc.isAPManger2$
        .pipe(
          take(1),
          tap((isAp2) => {
            if (
              isAp2 &&
              this.details.approvals.find(
                (item) => item.role.id === RoleConstant.companyAdminId
              )
            ) {
              this.disableUpdate = true;
            }
          })
        )
        .subscribe();

      this.contextSvc.isCompanyAdmin$
        .pipe(
          take(1),
          tap((isCA) => {
            if (
              isCA &&
              this.details.status == this.serviceRequestStatus.pendingApproval
            ) {
              this.disableUpdate = false;
            }
          })
        )
        .subscribe();
    }
  }

  onInvoiceDateChange(selectedDate: Date) {
    const dueDate = this.form.get('dueDate');
    if (dueDate?.value !== null && selectedDate > new Date(dueDate.value)) {
      dueDate.setValue(null);
    }
    this.minDate = selectedDate;
  }

  onFilesSelected($event: Event, fileUploadCtrl: HTMLInputElement): void {
    if (!this.files) {
      this.files = [];
    }
    let newFileExists = false;
    const input = $event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (!this.files.some((x) => x.name === file.name)) {
          this.files.push(file);
          this.uploadStatusMap[file.name] = { uploading: true, error: false };
          newFileExists = true;
        }
      }
      fileUploadCtrl.value = '';
    }

    if (newFileExists) {
      this.uploadFiles();
    }
  }

  uploadFiles() {
    from(
      this.files.filter((item) => this.uploadStatusMap[item.name]?.uploading)
    )
      .pipe(
        mergeMap((file) => {
          const formData = new FormData();
          formData.append('file', file as File);
          return this.apSvc.uploadAttachmentAsync(formData).pipe(
            tap(() => {
              this.uploadStatusMap[file.name].uploading = false;
              this.uploadStatusMap[file.name].error = false;
            }),
            catchError(() => {
              this.uploadStatusMap[file.name].uploading = false;
              this.uploadStatusMap[file.name].error = true;
              return of(null);
            }),
            untilDestroyed(this)
          );
        })
      )
      .subscribe((data) => {
        if (data) {
          this.files = this.files.map((file) => {
            if (file.name === data.name) {
              return { ...data };
            }
            return file;
          });
        }
      });
  }

  removeFile(idx: number): void {
    this.files.splice(idx, 1);
  }

  isFileModel(file: File | FileModel): file is FileModel {
    return !!(file as FileModel).webUrl;
  }

  addItem() {
    const { chartOfAccountId, storeId, storeGroupId, amount, id } =
      this.itemForm.value;
    const formArrayValue = this.allocateAmountFormArray.value;
    const allocatedBy = this.allocatedByControl.value;
    const allocationType = this.allocateAmountControl.value;

    if (allocationType) {
      (storeId || []).forEach((item, index) => {
        const value =
          allocatedBy === AllocateByOptions.amount
            ? formArrayValue[index].amount
            : (formArrayValue[index].amount / 100) * (amount || 0);

        this.items.push({
          id: index === 0 ? id : null,
          coa: chartOfAccountId,
          storeGroup: storeGroupId.filter(({ id }) => id === item.storeGroupId),
          store: [item],
          allocatedAmount: value,
        });
      });
    } else {
      this.items.push({
        id,
        coa: chartOfAccountId,
        storeGroup: storeGroupId,
        store: storeId,
        allocatedAmount: amount,
      });
    }

    this.itemForm.reset();
  }

  onRemove(index: number, id: string) {
    if (!id) {
      this.items.splice(index, 1);
      this.reCalculate$.next(true);
      return;
    }

    this.apSvc
      .delteRequestItem(id)
      .pipe(
        take(1),
        tap(() => {
          this.items.splice(index, 1);
          this.reCalculate$.next(true);
        })
      )
      .subscribe();
  }

  onEdit(index: number) {
    const { id, coa, storeGroup, store, allocatedAmount } = {
      ...this.items[index],
    };
    this.itemForm.reset();
    this.itemForm.patchValue({
      id,
      chartOfAccountId: coa,
      storeGroupId: storeGroup,
      amount: allocatedAmount,
      allocateAmount: null,
    });
    //wait for stores to load based on seleted store groups
    this.isLoading$
      .pipe(
        filter((data) => !data.store),
        take(2)
      )
      .subscribe(() => {
        this.itemForm.controls['storeId'].setValue(store);
      });
    //remove item from table
    this.items.splice(index, 1);
    this.reCalculate$.next(true);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.items.length === 0) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const hasAnyValue = Object.values(this.itemForm.value).some((value) =>
      Array.isArray(value) ? !!value.length : !!value
    );
    if (hasAnyValue && this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (this.remainingAmountControl.value) {
      this.modalRef = this.modalSvc.show(this.confirmModal, {
        class: 'modal-dialog-centered',
        ignoreBackdropClick: true,
      });
      return;
    }

    this.onEmit.emit(this.returnPayload());
  }

  onConfirmSubmission() {
    this.modalRef.hide();
    this.onEmit.emit(this.returnPayload());
  }

  onCancel() {
    this.modalRef.hide();
    this.allocateAmountControl.reset();
    this.allocatedByControl.setValue(AllocateByOptions.percentage);
  }

  onAllocate() {
    this.allocateAmountFormArray.controls.forEach((group) => {
      const control = group.get('amount');
      control.markAsTouched();
    });
    if (this.allocateAmountFormArray.valid) {
      this.modalRef.hide();
    }
  }

  allocateAmount() {
    //reset existing values if any before allocating and assigning new values
    this.allocateAmountFormArray.controls.forEach((group) => {
      const control = group.get('amount');
      control.setValue(0, {
        emitEvent: false,
      });
      control.markAsPristine();
      control.markAsUntouched();
      control.setErrors(null);
    });

    const total = this.totalAmountControl?.value || 0;
    const allocationType = this.allocateAmountControl.value;
    const allocatedBy = this.allocatedByControl.value;
    const isEqually = allocationType === this.amountAllocatedOptions.equally;
    const itemCount = this.allocateAmountFormArray.length;

    const equalValue = isEqually
      ? Number(
          (allocatedBy === AllocateByOptions.amount
            ? total / itemCount
            : 100 / itemCount
          ).toFixed(2)
        )
      : 0;
    //if amount is 100 and number of stores is 3
    //amount should be allocated like this 33.33, 33.33 & 33.34 (if equally option is selected)
    //this is just an example of how amount should be allocated
    this.allocateAmountFormArray.controls.forEach((group, index) => {
      const control = group.get('amount');
      const isLastIndex =
        isEqually &&
        this.remainingAmountToAllocate &&
        index === this.allocateAmountFormArray.value.length - 1;

      control.setValue(
        isLastIndex
          ? allocatedBy === AllocateByOptions.amount
            ? this.remainingAmountToAllocate
            : 100 -
              this.allocateAmountFormArray.value.reduce(
                (acc, item) => acc + (item.amount || 0),
                0
              )
          : equalValue,
        {
          emitEvent: false,
        }
      );

      control.markAsPristine();
      control.markAsUntouched();
      control.setErrors(null);
    });
  }

  returnPayload(): AccountsPayableWriteModel {
    const payload = {
      ...this.form.value,
      companyId: this.contextSvc.user.value?.userRoles?.[0]?.company?.id ?? '',
      files: this.files as FileModel[],
      accountsPayableItems: this.items.map((item) => ({
        id: item.id,
        chartOfAccountId: item.coa.id,
        storeGroupId: item.storeGroup.map(({ id }) => id)[0],
        storeId: item.store.map(({ id }) => id)[0],
        description: '',
        amount: item.allocatedAmount,
      })),
    } as AccountsPayableWriteModel;

    return payload;
  }
}
