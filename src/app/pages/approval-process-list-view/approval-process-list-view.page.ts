import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, finalize, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

/** Services */
import { UserModel } from '../../models/user-model';
import { ContextService } from '../../services/context.service';
import { ApprovalProcessSearchRequestModel } from '../../models/request/approval-process-search-request-model';
import { ApprovalProcessWithCategoriesModel } from '../../models/approval-process-model';
import { DatePipe } from '@angular/common';
import { ServiceRequestType } from 'src/app/models/service-request-type';
import { RepairAndMaintenanceCategoryService } from 'src/app/services/repair-and-maintenance-category.service';
import { FormControl } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { CategorySearchRequestModel } from 'src/app/models/request/category-search-request-model';
import { CategoryModel } from 'src/app/models/category-model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/utils/toaster.service';


@Component({
  selector: 'approval-process-list-view',
  templateUrl: './approval-process-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class ApprovalProcessListViewPage implements OnInit, OnDestroy {

  isLoading$ = new BehaviorSubject<boolean>(false);
  refetch$ = new BehaviorSubject<boolean>(false);
  searchCtrl = new FormControl('');
  statusCtrl = new FormControl('');
  pageCtrl = new FormControl(1);

  public storeID: any;
  public categoryID: any;
  modalRef?: BsModalRef;

  selectedApprovalModel: ApprovalProcessWithCategoriesModel | null = null;

  private searchTerm$ = this.searchCtrl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.pageCtrl.setValue(1, { emitEvent: false }))
  );

  private page$ = this.pageCtrl.valueChanges.pipe(
    startWith(1),
    distinctUntilChanged()
  );

  list$ = combineLatest([
  this.searchTerm$,
  this.page$,
  this.refetch$,
]).pipe(
  debounceTime(50),
  tap(() => {
    this.isLoading$.next(true);
  }),
  switchMap(([search, _page, _reFetch]) => {
    const payload = {
      companyIds: [this.user.userRoles[0].company.id],
      type: ServiceRequestType.repairAndMainenance,
      page: this.pageCtrl.value,
      pageSize: 10,
      keyword: search,
    } as ApprovalProcessSearchRequestModel;

    if (!search) delete payload.keyword;

    return this.repairAndMaintenanceCategorySvc
      .searchApprovalProcessAsync<ApprovalProcessWithCategoriesModel>(payload)
      .pipe(
        tap(response => {
          console.log('API Response:', response);
          this.isLoading$.next(false);
        })
      );
  })
);



  public user: UserModel;

  public categories: CategoryModel[];

  public serviceRequestType = ServiceRequestType;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private cd: ChangeDetectorRef,
    private contextSvc: ContextService,
    private modalSvc: BsModalService,
    private repairAndMaintenanceCategorySvc: RepairAndMaintenanceCategoryService, 
    private categorySvc: CategoryService,
    private toasterService: ToasterService,) { }


  ngOnInit() {

    this.user = this.contextSvc.user.getValue();

    this.getRepairAndMaintenancecategories();
  }


  public getRepairAndMaintenancecategories() {
    this.categorySvc
      .searchAsync(<CategorySearchRequestModel>{
        page: 1,
        pageSize: 100000,
        type: this.serviceRequestType.repairAndMainenance
      })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(categoryRes => {
        this.categories = categoryRes.items;
        this.markForCheck();
      });

  }

  getCategoryName(id: string): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '';
  }


  public checkIfUserHasRole(roleId: string): boolean {

    return this.user && this.user.userRoles && this.user.userRoles.some(x => x.roleId === roleId);

  }

  onPageChanged(page: number): void {
    this.pageCtrl.setValue(page);
  }

  openDetailModal(template: TemplateRef<any>, storeID: any) {
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-right modal-lg',
      ignoreBackdropClick: true,
      keyboard: false,
    });

    // Create payload with storeId
    const payload: ApprovalProcessSearchRequestModel = {
      storeIds: [storeID],
      type: ServiceRequestType.repairAndMainenance,
      companyIds: [this.user.userRoles[0].company.id],
      page: 1,
      pageSize: 1
    } as ApprovalProcessSearchRequestModel;

    this.repairAndMaintenanceCategorySvc
      .searchApprovalEditAsync<ApprovalProcessWithCategoriesModel>(payload)
      .subscribe(response => {
        if (response && response.items.length) {
          this.selectedApprovalModel = response.items[0];
        }
      });
  }


  openModal(template: TemplateRef<any>, storeID: any, categoryID: any) {

    this.storeID = storeID;
    this.categoryID = categoryID;
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-centered delete-modal-wrap',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  onConfirmDelete() {
    this.modalRef?.hide();
    this.isLoading$.next(true);
    this.repairAndMaintenanceCategorySvc
      .deleteApprovalAsync(this.storeID, this.categoryID)
      .pipe(
        take(1),
        finalize(() => this.isLoading$.next(false))
      )
      .subscribe(() => this.refetch$.next(true));
      this.toasterService.showSuccess('Item deleted successfully!', 'Success')
      
  }

 getFlattenedApprovalList() {
  const flattened: any[] = [];
  const seenRoles = new Set<string>();

  this.selectedApprovalModel?.categoryApprovalObj?.forEach(cat => {
    const categoryId = cat?.category?.id;
    const categoryName = cat?.category?.name;

    if (!categoryId || !categoryName || !Array.isArray(cat?.userRoleId)) {
      return;
    }

    cat.userRoleId.forEach(role => {
      if (!role) return;

      const uniqueKey = `${categoryId}_${role.userName}_${role.roleName}`;

      if (!seenRoles.has(uniqueKey)) {
        seenRoles.add(uniqueKey);

        flattened.push({
          order: role.order ?? 9999,
          userName: role.userName || 'N/A',
          roleName: role.roleName || 'N/A',
          categoryId,
          categoryName
        });
      }
    });
  });

  // Sort by backend order
  flattened.sort((a, b) => a.order - b.order);

  // Re-assign sequential order starting from 1
  flattened.forEach((item, index) => {
    item.order = index + 1;
  });

  return flattened;
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



  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
