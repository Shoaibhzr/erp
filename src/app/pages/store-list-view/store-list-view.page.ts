import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/** Models */
import { StoreModel } from '../../models/store-model';
import { CompanyModel } from '../../models/company-model';
import { PagedList } from '../../models/common/paged-list';
import { StoreSearchRequestModel } from '../../models/request/store-search-request-model';

/** Services */
import { StoreService } from '../../services/store.service';
import { CompanyService } from '../../services/company.service';
import { UserModel } from '../../models/user-model';
import { ContextService } from '../../services/context.service';
import { RoleConstant } from '../../models/role-constant';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'store-list-view',
  templateUrl: './store-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class StoreListViewPage implements OnInit, OnDestroy {
 @ViewChild('storeDetailTemplate') storeDetailTemplate!: TemplateRef<any>;
  public searchTerm: string = "";

  public user: UserModel;

  public isHttpRequestInProcess: boolean;

  private searchDebounce = new Subject<string>();

  public storePagedListModel: PagedList<StoreModel>;

  public modalRef?: BsModalRef;

  public selectedStoreModel: StoreModel;

  public RoleConstant = RoleConstant;

  public storeSearchRequestModel: StoreSearchRequestModel;

  private ngUnSubscribe: Subject<void> = new Subject<void>();
  isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private cd: ChangeDetectorRef, private contextSvc:ContextService, 
    private storeSvc: StoreService, private datePipe: DatePipe, private modalSvc: BsModalService,) { }

  ngOnInit() {

    this.isHttpRequestInProcess = true;

    this.markForCheck();

    this.user = this.contextSvc.user.getValue();

    this.searchDebounce.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.ngUnSubscribe)
    ).subscribe({
      next: (result) => {
        this.search();
        this.markForCheck();
      }
    });

    this.search();

  }

  public search() {
  if (!this.storeSearchRequestModel) {
    this.storeSearchRequestModel = <StoreSearchRequestModel>{
      page: 1,
      pageSize: Math.floor(window.innerHeight / 70)
    };
  }

  if (this.searchTerm && this.searchTerm.length > 0) {
    this.storeSearchRequestModel.keyword = this.searchTerm;
    this.storeSearchRequestModel.page = 1; 
  } else {
    delete this.storeSearchRequestModel.keyword;
  }

  this.isLoading$.next(true);

  this.storeSvc.searchAsync(this.storeSearchRequestModel)
    .pipe(takeUntil(this.ngUnSubscribe))
    .subscribe(x => {
      this.storePagedListModel = x;

      if (!this.selectedStoreModel && x.totalRecords > 0) {
        this.selectedStoreModel = x.items[0];
      }

      this.isLoading$.next(false);
      this.isHttpRequestInProcess = false;

      this.markForCheck();
    });
}


  public select(store: StoreModel): void {
      
        this.selectedStoreModel = store;
        const initialState: ModalOptions = {
          class: 'modal-dialog-right modal-lg',  // Use modal-lg for 50% width
          animated: true,
          initialState: {
            store: this.selectedStoreModel
          }
        };
        
        this.modalRef = this.modalSvc.show(this.storeDetailTemplate, initialState);
        this.markForCheck();
      }

  public searchByKeyword() {

    this.storeSearchRequestModel.page = 1;

    this.storeSearchRequestModel.pageSize = Math.floor(window.innerHeight / 70);

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }

  public checkIfUserHasRole(roleId: string): boolean {

    return this.user && this.user.userRoles && this.user.userRoles.some(x => x.roleId === roleId);

  }

 onPageChanged($event: any): void {
  if (this.storeSearchRequestModel.page !== $event.page) {
    this.storeSearchRequestModel.page = $event.page;
    this.search(); 
  }
}


  openModal(template: TemplateRef<any>, store: any) {
      this.selectedStoreModel = store;
      this.modalRef = this.modalSvc.show(template, {
        class: 'modal-dialog-centered delete-modal-wrap',
        ignoreBackdropClick: true,
        keyboard: false,
      });
    }

    public delete() {
    this.isLoading$.next(true);
    this.storeSvc
      .deleteStoreAsync(this.selectedStoreModel.id)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((companies: any) => {
        this.search();
        this.modalRef?.hide();
        this.isLoading$.next(false);
        this.cd.markForCheck();
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
