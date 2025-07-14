import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';


/** Services */
import { StoreService } from '../../services/store.service';
import { CompanyService } from '../../services/company.service';

/** Models */
import { RoleModel } from '../../models/role-model';
import { StoreModel } from '../../models/store-model';
import { RoleConstant } from '../../models/role-constant';
import { CompanyModel } from '../../models/company-model';
import { ApprovalProcessModel, ApprovalProcessWithCategoriesModel } from '../../models/approval-process-model';

import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';
import { RepairAndMaintenanceCategoryModel } from '../../models/repair-and-maintenance-category-model';
import { RepairAndMaintenanceCategoryService } from '../../services/repair-and-maintenance-category.service';
import { ApprovalProcessSearchRequestModel } from '../../models/request/approval-process-search-request-model';
import { ServiceRequestType } from '../../models/service-request-type';
import { CategoryService } from 'src/app/services/category.service';
import { CategorySearchRequestModel } from 'src/app/models/request/category-search-request-model';
import { CategoryModel } from 'src/app/models/category-model';
import { UserService } from 'src/app/services/user.service';
import { ApprovalProcessCreateRMRequestModel } from 'src/app/models/request/approval-process-approver-model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserApprovalModel } from 'src/app/models/user-approval-model';

@Component({
  selector: 'approval-process-create',
  templateUrl: './approval-process-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApprovalProcessCreatePage implements OnInit, OnDestroy {

  @ViewChild('duplicateCattemplate', { static: false }) duplicateCattemplate!: TemplateRef<any>;

  public id: string;

  public form!: FormGroup;

  public isInitInProgress: boolean;

  public isCreateRequestInProgress: boolean;

  public approvalProcessModel: ApprovalProcessWithCategoriesModel | null = null;

  public companies: CompanyModel[];

  public stores: StoreModel[];

  public storeGroupsArray: any[];

  public storesArray: any[];

  public categories: CategoryModel[];

  selectedCategoryIds: string[] = [];

  approvalCriteria: {
    [catId: string]: { id?: string, name: string; order: number; role: string | UserApprovalModel }[];
  }

  categoryRoles: { [catId: string]: string } = {};

  editingApproverIndex: { [catId: string]: number } = {};

  public companyId: string;

  public storeId: string;

  public categoryId: string;

  public duplicateCatMsg: string;

  public modalRef?: BsModalRef;

  public paramCompanyId: string;

  public paramStoreId: string;


  public selectCategories: RepairAndMaintenanceCategoryModel[];

  public approvalProcessSearchRequestModel: ApprovalProcessSearchRequestModel;

  public requestType: ServiceRequestType;

  public serviceRequestType = ServiceRequestType;

  public roles: any[];

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private companySvc: CompanyService,
    private categorySvc: CategoryService,
    private storeSvc: StoreService,
    private repairAndMaintenanceCategorySvc: RepairAndMaintenanceCategoryService,
    private router: Router,
    private modalService: BsModalService,
    private location: Location,
    private route: ActivatedRoute,
    private userSvc: UserService,
    ) {

  }

  ngOnInit() {
    this.initForm();

    this.handleCompanyChange();
    this.handleStoreGroupChange();
    this.handleStoreChange();

    
    this.getRepairAndMaintenancecategories();
this.form.get('storeId')?.valueChanges.subscribe((storeId) => {
  this.getUserRoles(storeId);
});
  //   this.form.get('storeId')?.valueChanges.subscribe((storeId) => {
  //   const categoryControl = this.form.get('categoryId');
  //   if (storeId) {
  //     categoryControl?.enable();
  //   } else {
  //     categoryControl?.disable();
  //     categoryControl?.reset();
  //   }
  // });

    this.form.get('categoryId')?.valueChanges
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(() => {
        this.onCategorySelect();
      });

    this.isInitInProgress = false;
    this.markForCheck();

    this.route.queryParams.subscribe(params => {
      this.requestType = params['type'];
      this.id = this.route.snapshot.params["id"];
      this.paramStoreId = params['storeId'];
      this.paramCompanyId = params['companyId'];

      if (this.id) {
        setTimeout(() => {
          this.search();
        }, 0);
      }
    });
  }



  public search() {
    const payload: ApprovalProcessSearchRequestModel = {
      storeIds: [this.paramStoreId],
      type: ServiceRequestType.repairAndMainenance,
      companyIds: [this.paramCompanyId],
      page: 1,
      pageSize: 1
    } as ApprovalProcessSearchRequestModel;

    this.repairAndMaintenanceCategorySvc
      .searchApprovalEditAsync<ApprovalProcessWithCategoriesModel>(payload)
      .subscribe(response => {
        if (response && response.items.length) {
          this.approvalProcessModel = response.items[0];
          this.patchApprovalCriteria(response.items[0].categoryApprovalObj);
          this.getStoresByGroupId(
            this.approvalProcessModel.storeGroupId,
            this.approvalProcessModel.storeId
          );

          const approvals = {
            id: this.approvalProcessModel.id,
            name: this.approvalProcessModel.name,
            description: this.approvalProcessModel.description,
            companyId: this.approvalProcessModel.companyId,
            storeId: this.approvalProcessModel.storeId,
            storeGroupId: this.approvalProcessModel.storeGroupId,
            categoryId: this.approvalProcessModel.categories || [],

            serviceRequestType: ServiceRequestType.repairAndMainenance
          };

          this.selectedCategoryIds = this.approvalProcessModel.categories || [];

          this.form.patchValue(approvals);
          this.markForCheck();
        }

      });

  }

 patchApprovalCriteria(categoryApprovalObj: any[]): void {
  this.approvalCriteria = {};
  this.categoryRoles = {};

  categoryApprovalObj?.forEach((item) => {
    const catId = item?.category?.id;

    if (!this.approvalCriteria[catId]) {
      this.approvalCriteria[catId] = [];
    }

    item.userRoleId.forEach((role: any) => {
      const existingRoles = this.approvalCriteria[catId];

      const alreadyExists = existingRoles.some(
        (r) => r.id === role.id || r.role === role.roleName
      );

      if (!alreadyExists) {
        existingRoles.push({
          id: role.id,
          name: role.userName,
          order: role.order, 
          role: role.roleName,
        });

        // this.categoryRoles[catId] = role.id;
      }
    });

    this.approvalCriteria[catId].sort((a, b) => a.order - b.order);
  });

  this.markForCheck();
}


allSelectedCategoriesHaveApprovalCriteria(): boolean {
  if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
    return false;
  }

  return this.selectedCategoryIds.every(catId =>
    Array.isArray(this.approvalCriteria[catId]) &&
    this.approvalCriteria[catId].length > 0
  );
}




  private initForm() {
    this.form = this.fb.group({
      id: [null],
      companyId: [null, [Validators.required]],
      storeId: [null, [Validators.required]],
      storeGroupId: [null, [Validators.required]],
      categoryId: [null, Validators.required],
      serviceRequestType: [ServiceRequestType.repairAndMainenance],
      name: [null, [Validators.required, Validators.maxLength(50)]],
      description: [null, [Validators.required, Validators.maxLength(1024)]],
    });
  }

  get description(): string {
  return this.form.get('description')?.value || '';
}


  private getRepairAndMaintenancecategories() {
    this.categorySvc
      .searchAsync(<CategorySearchRequestModel>{
        page: 1,
        pageSize: 100000,
        type: this.serviceRequestType.repairAndMainenance
      })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(categoryRes => {
        this.categories = categoryRes.items;

        this.companySvc
          .searchAsync(<CompanySearchRequestModel>{ page: 1, pageSize: 100000 })
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe(companyRes => {
            this.companies = companyRes.items;
            this.markForCheck();
          });
      });

    this.isInitInProgress = false;
  }


  private handleCompanyChange(): void {
  this.form.get('companyId')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      filter(companyId => !!companyId),
      takeUntil(this.ngUnSubscribe)
    )
    .subscribe((companyId: string) => {
      this.companyId = companyId;

      const storeGroupId = this.form.get('storeGroupId')?.value;
      const storeId = this.form.get('storeId')?.value;

      
      if (storeGroupId || storeId) {
        this.form.patchValue(
          {
            storeGroupId: '',
            storeId: ''
          },
          { emitEvent: false }
        );
      }

      this.getStoreGroups(companyId);
    });
}


  private handleStoreGroupChange(): void {
    this.form.get('storeGroupId')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter(groupId => !!groupId),
        takeUntil(this.ngUnSubscribe)
      )
      .subscribe((groupId: string) => {
        this.form.patchValue({
          storeId: ''
        }, { emitEvent: false });

        this.getStoresByGroupId(groupId);
      });
  }

  private handleStoreChange(): void {
    this.form.get('storeId')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter(storeId => !!storeId),
        takeUntil(this.ngUnSubscribe)
      )
      .subscribe((storeId: string) => {
        this.storeId = storeId;


      });
  }

  private getStoreGroups(companyId: string): void {
  const currentStoreGroupId = this.form.get('storeGroupId')?.value;

  if (currentStoreGroupId) {
    this.form.patchValue({ storeGroupId: '' }, { emitEvent: false });
  }

  this.storeGroupsArray = [];

  this.storeSvc.getStoreGroups(companyId)
    .pipe(takeUntil(this.ngUnSubscribe))
    .subscribe((storeGroups: any) => {
      this.storeGroupsArray = storeGroups;
      this.markForCheck();
    });
}


  private getStoresByGroupId(groupId: string, patchStoreId?: string): void {
    this.form.patchValue({ storeId: '' }, { emitEvent: false });
    this.storesArray = [];

    this.storeSvc.getStores(groupId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((stores: any) => {
        this.storesArray = stores;

        if (patchStoreId && stores.some((s: any) => s.id === patchStoreId)) {
          this.form.patchValue({ storeId: patchStoreId });
        }

        this.markForCheck();
      });
  }


  private getUserRoles(storeId:any): void {
    this.userSvc.getCompanyRolesAsync(storeId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((userRoles: any) => {
        this.roles = userRoles;
        this.markForCheck();
      });
  }


 onCategorySelect(): void {
  const selected = this.form.get('categoryId')?.value || [];

  const updatedSelections: string[] = [];
  const checkPromises: Promise<void>[] = [];

  // Identify removed categories to avoid extra API calls
  const removedCategoryIds = this.selectedCategoryIds.filter(
    (prevCatId) => !selected.includes(prevCatId)
  );

  // Clean up removed categories
  removedCategoryIds.forEach((removedCatId) => {
    delete this.categoryRoles[removedCatId];
    delete this.approvalCriteria[removedCatId];
  });

  selected.forEach((catId: string) => {
    if (this.selectedCategoryIds.includes(catId)) {
      updatedSelections.push(catId);
      return;
    }

    const payload = {
      companyId: this.form.get('companyId')?.value,
      storeId: this.form.get('storeId')?.value,
      categoryId: catId,
    };

    const checkPromise = new Promise<void>((resolve) => {
      this.repairAndMaintenanceCategorySvc.checckStoreCategoryAsync(payload).subscribe({
        next: () => {
          const catName = this.getCategoryName(catId);
          const storeName = this.getStoreName(this.storeId);
          const message = `
            <p>An approval process for "<strong>${catName}</strong>" has already been created for the "<strong>${storeName}</strong>".</p>
            <p>Please choose a different category or store.</p>
          `;

          // Remove from form if duplicate
          const current = this.form.get('categoryId')?.value || [];
          this.form.get('categoryId')?.setValue(current.filter((r: any) => r !== catId));

          this.openDuplicateModal(message);
          resolve();
        },
        error: (err) => {
          if (err.status === 400) {
            // Valid category
            updatedSelections.push(catId);
          }
          resolve();
        },
      });
    });

    checkPromises.push(checkPromise);
  });

  Promise.all(checkPromises).then(() => {
    // Ensure objects are initialized
    if (!this.approvalCriteria) this.approvalCriteria = {};
    if (!this.categoryRoles) this.categoryRoles = {};

    // Final list = newly allowed + already existing ones not removed
    const finalSelected = selected.filter((id: string) =>
      updatedSelections.includes(id) || this.selectedCategoryIds.includes(id)
    );

    // Set defaults for new categories
    finalSelected.forEach((catId: string) => {
      if (!this.categoryRoles[catId]) {
        this.categoryRoles[catId] = null;
      }
      if (!this.approvalCriteria[catId]) {
        this.approvalCriteria[catId] = [];
      }
    });

    // Update the selectedCategoryIds finally
    this.selectedCategoryIds = finalSelected;

    setTimeout(() => this.markForCheck());
  });
}




  openDuplicateModal(message: string) {
    this.duplicateCatMsg = message;
    this.modalRef = this.modalService.show(this.duplicateCattemplate, {
      class: 'modal-dialog-centered user-create-modal',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  getCategoryName(id: string): string {
    const cat = this.categories?.find(c => c.id === id);
    return cat ? cat.name : '';
  }

  getStoreName(id: string): string {
    const store = this.storesArray?.find(s => s.id === id);
    return store ? store.name : '';
  }

  trackByCategoryId(index: number, id: string): string {
    return id;
  }

  onRoleSelect(catId: string): void {
    const roleId = this.categoryRoles[catId];
    const selectedRole = this.roles.find(r => r.id === roleId);

    if (selectedRole && catId) {
      if (!this.approvalCriteria[catId]) {
        this.approvalCriteria[catId] = [];
      }

      const currentList = this.approvalCriteria[catId];

      const editingIndex = this.editingApproverIndex[catId];

      const newEntry = {
        id: selectedRole.id,
        name: selectedRole.userName,
        order: editingIndex != null ? currentList[editingIndex].order : currentList.length + 1,
        role: selectedRole.roleName
      };

      if (editingIndex != null) {
        // Update existing
        this.approvalCriteria[catId][editingIndex] = newEntry;
        delete this.editingApproverIndex[catId];
      } else {
        // Add new
        this.approvalCriteria[catId].push(newEntry);
      }

      this.categoryRoles[catId] = null;

      setTimeout(() => this.markForCheck());
    }
  }


  deleteApprover(catId: string, index: number): void {
  if (this.approvalCriteria[catId]) {
    // Remove the item at the given index
    this.approvalCriteria[catId].splice(index, 1);

    // Recalculate order
    this.approvalCriteria[catId] = this.approvalCriteria[catId].map((item, i) => ({
      ...item,
      order: i + 1
    }));

    // Print updated array for debugging
    console.log('Updated approvalCriteria:', this.approvalCriteria[catId]);

    // Trigger change detection
    setTimeout(() => this.markForCheck());
  }
}


  editApprover(catId: string, index: number): void {
    const approver = this.approvalCriteria[catId][index];
    if (approver) {
      this.editingApproverIndex[catId] = index;

      const selected = this.roles.find(
        r => r.userName === approver.name && r.roleName === approver.role
      );
      if (selected) {
        this.categoryRoles[catId] = selected.id;
      }

      setTimeout(() => this.markForCheck());
    }
  }

   openCreateModal(template: TemplateRef<any>) {
    if (this.form.valid) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-dialog-centered user-create-modal',
        ignoreBackdropClick: true,
        keyboard: false,
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }

confirmCreate() {
    this.create();
    this.modalRef?.hide();
  }



  public create(): void {
    if (!this.form.valid) {
      this.markForCheck();
      return;
    }

    this.isCreateRequestInProgress = true;
    this.markForCheck();

    const requestModel = this.buildRequestModel();

    this.submitRequest(requestModel)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe({
        next: () => {
          this.router.navigateByUrl("/approval-processes/list?type=" + this.requestType);
          this.markForCheck();
        },
        error: () => {
          this.isCreateRequestInProgress = false;
          this.markForCheck();
        }
      });
  }

  private buildRequestModel(): ApprovalProcessCreateRMRequestModel {
    const baseFormData = this.form.getRawValue();

    const categoryCreateApproval = Object.keys(this.approvalCriteria).map(catId => {
      const userRoleIds = this.approvalCriteria[catId]
        .map(item => item.id) // use stored id directly
        .filter((id): id is string => !!id);

      return {
        categoryId: catId,
        userRoleId: userRoleIds
      };
    });

    return {
      id: baseFormData.id,
      companyId: baseFormData.companyId,
      storeId: baseFormData.storeId,
      storeGroupId: baseFormData.storeGroupId,
      name: baseFormData.name,
      description: baseFormData.description,
      serviceRequestType: baseFormData.serviceRequestType,
      categoryCreateApproval
    };
  }


  private submitRequest(model: ApprovalProcessCreateRMRequestModel): Observable<void> {
    return new Observable<void>(observer => {
      const request$ = this.id
        ? this.repairAndMaintenanceCategorySvc.updateApprovalProcessAsync(model)
        : this.repairAndMaintenanceCategorySvc.createApprovalProcessAsync(model);

      request$.pipe(takeUntil(this.ngUnSubscribe)).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }


   getOrdinalSuffix(order: number): string {
  if (order % 100 >= 11 && order % 100 <= 13) return 'th';
  switch (order % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

getBadgeColorClass(order: number): string {
  const colorMap: { [key: number]: string } = {
    1: 'bg-purple text-purple',
    2: 'bg-danger-light text-danger',
    3: 'bg-success-light text-success',
    4: 'bg-info-light text-info',     
    5: 'bg-warning-light text-warning',  
    6: 'bg-primary text-white',          
  };

  // Fallback for orders 7 and above
  if (colorMap[order]) {
    return colorMap[order];
  }

  const fallbackColors = [
    'bg-secondary text-white',
    'bg-dark text-white',
    'bg-light text-dark'
  ];
  const index = (order - 7) % fallbackColors.length;
  return fallbackColors[index];
}

isRoleAlreadySelected(catId: string, roleId: string): boolean {
  return this.approvalCriteria[catId]?.some((r: any) => r.id === roleId);
}

  public isCategoryEmpty(): boolean {
    return this.selectCategories.some(x => x.id === '0');
  }


  closeModal(): void {
  console.log('Close button clicked');
  if (this.modalRef) {
    this.modalService.hide()
  }
}



  public goBack() {
    this.location.back();
  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
