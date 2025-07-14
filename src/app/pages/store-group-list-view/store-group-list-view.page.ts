import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  startWith,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ContextService } from 'src/app/services/context.service';
import { RoleConstant } from 'src/app/models/role-constant';
import { StoreGroupModel } from 'src/app/models/store-model';
import { CompanySearchRequestModel } from 'src/app/models/request/company-search-request-model';


@Component({
  selector: 'store-group-list-view',
  templateUrl: './store-group-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreGroupListViewPage implements OnInit {
  @ViewChild('storeGroupDetailTemplate') storeGroupDetailTemplate!: TemplateRef<any>;
  public searchTerm: string = '';
  public isHttpRequestInProcess: boolean = false;
  public storeGroupPagedListModel: any;
  modalRef?: BsModalRef;
  user:any;
  activeDropdown: number | null = null;
  private searchDebounce = new Subject<string>();
  public storeGroups: any[] = [];
  selectedItem: any;
  pageCtrl = new FormControl(1);
  searchCtrl = new FormControl('');
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  isLoading$ = new BehaviorSubject<boolean>(false);
  public companySearchRequestModel: CompanySearchRequestModel;
 

  public searchRequest: any = {
    page: 1,
    pageSize: 10,
    type: 'store',
    ids: [],
    companyIds: [],
    Keyword: '',
  };

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private storeSvc: StoreService,
    private modalSvc: BsModalService,
    private contextSvc: ContextService
  ) {}

  ngOnInit() {
    this.user = this.contextSvc.user.getValue();
    
    this.user ? this.search():undefined;
    // Initialize component

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
  }

  public searchByKeyword() {

    this.searchRequest.page = 1;
    this.searchRequest.pageSize = Math.floor(window.innerHeight / 70);

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }

  public select(storeGroup: StoreGroupModel): void {
    
      this.selectedItem = storeGroup;
      const initialState: ModalOptions = {
        class: 'modal-dialog-right modal-lg',  // Use modal-lg for 50% width
        animated: true,
        initialState: {
          storeGroup: this.selectedItem
        }
      };
      
      this.modalRef = this.modalSvc.show(this.storeGroupDetailTemplate, initialState);
      this.markForCheck();
    }

  getStoreChunks(stores: any[], chunkSize: number = 3): any[][] {
    const chunks = [];
    for (let i = 0; i < stores.length; i += chunkSize) {
      chunks.push(stores.slice(i, i + chunkSize));
    }
    return chunks;
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  openModal(template: TemplateRef<any>, storeGroup: any) {
    this.selectedItem = storeGroup;
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-centered delete-modal-wrap',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  onConfirmDelete = () => {};

  public onPageChanged($event: any): void {

    if (this.searchRequest.page != $event.page) {

      this.searchRequest.page = $event.page;

      this.search();

    }

  }

  public search() {

    if(this.user && (this.user.userRoles.some((x:any)=>x.roleId === RoleConstant.globalAdminId)))
    {
      this.searchRequest.companyIds=[];
    }
    else
    {
      this.searchRequest.companyIds=[this.user.userRoles[0].company.id];
    }

    if (!this.searchRequest) {
        this.searchRequest =  {
          page: 1,
          pageSize: Math.floor(window.innerHeight / 70)
        };
      }
    
      if (this.searchTerm?.length > 0) {
        this.searchRequest.keyword = this.searchTerm;
      } else {
        delete this.searchRequest.keyword;
      }
    this.isHttpRequestInProcess = true;
    this.isLoading$.next(true);
    this.storeSvc
      .searchStoreGroupsAsync(this.searchRequest)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((companies: any) => {
    
        this.storeGroups = companies.items;
        this.totalRecords = companies.totalRecords;
        this.currentPage = this.searchRequest.page;
        this.pageSize = this.searchRequest.pageSize;
         this.isHttpRequestInProcess = false;
        this.isLoading$.next(false);
        this.cd.markForCheck();
      });
  }

  public delete() {
    this.isLoading$.next(true);
    this.storeSvc
      .deleteStoreGroupAsync(this.selectedItem.id)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((companies: any) => {
        this.search();
        this.modalRef?.hide();
        this.isLoading$.next(false);
        this.cd.markForCheck();
      });
  }

  toggleDropdown(index: number): void {
 
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  public edit(storeGroup: any) {
    this.router.navigate(['/store-group/edit', storeGroup.id]);
  }

  private markForCheck() {
    this.cd.markForCheck();
  }
}
