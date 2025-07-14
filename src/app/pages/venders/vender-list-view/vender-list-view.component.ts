import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PagedList } from 'src/app/models/common/paged-list';
import { UserSearchRequestModel } from 'src/app/models/request/user-search-request-model';
import { VendorSearchRequestModel } from 'src/app/models/request/vendor-search-request-model';
import { UserModel } from 'src/app/models/user-model';
import { UserService } from 'src/app/services/user.service';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-vender-list-view',
  templateUrl: './vender-list-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class VenderListViewComponent {
  @ViewChild('vendorDetailTemplate') vendorDetailTemplate!: TemplateRef<any>;

public isHttpRequestInProcess: boolean;

modalRef?: BsModalRef;

  public userPagedListModel: PagedList<UserModel>;

  public searchTerm: string = "";

  private searchDebounce = new Subject<string>();

  public selectedUserModel: UserModel;

  public vendorSearchRequestModel: UserSearchRequestModel;

  isLoading$ = new BehaviorSubject<boolean>(false);

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private venderSvc: VendorService,
    private datePipe: DatePipe,  private modalSvc: BsModalService,  private userSvc: UserService,
  ) {

  }

  ngOnInit() {

    this.isHttpRequestInProcess = true;

    this.markForCheck();

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

    if (!this.vendorSearchRequestModel) {

      this.vendorSearchRequestModel = <UserSearchRequestModel>{ page: 1, pageSize: 10, userTypeSearch: 'Vendor' };

    }

    if (this.searchTerm && this.searchTerm.length > 0) {

      this.vendorSearchRequestModel.keyword = this.searchTerm;

    }
    else {

      delete this.vendorSearchRequestModel.keyword;

    }

    this.isLoading$.next(true);

    this.userSvc.searchAsync(this.vendorSearchRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(x => {

      this.userPagedListModel = x;

      if (!this.selectedUserModel) {

        if (this.userPagedListModel.totalRecords > 0) {

          this.selectedUserModel = this.userPagedListModel.items[0];

        }

      }

      this.isHttpRequestInProcess = false;
      this.isLoading$.next(false);

      this.markForCheck();

    });

  }


  getShortName(name: string): string {
    const words = name.split(' ');
    return words.length > 2 ? `${words[0]} ${words[1]}...` : name;
  }


  public searchByKeyword() {

    this.vendorSearchRequestModel.page = 1;
    this.vendorSearchRequestModel.pageSize = 10;

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }


  public onPageChanged($event: any): void {

    if (this.vendorSearchRequestModel.page != $event.page) {

      this.vendorSearchRequestModel.page = $event.page;

      this.search();

    }

  }

  public select(user: UserModel): void {
    
      this.selectedUserModel = user;
      const initialState: ModalOptions = {
        class: 'modal-dialog-right modal-lg',  // Use modal-lg for 50% width
        animated: true,
        initialState: {
          user: this.selectedUserModel
        }
      };
      
      this.modalRef = this.modalSvc.show(this.vendorDetailTemplate, initialState);
      this.markForCheck();
    }

  openModal(template: TemplateRef<any>, user: UserModel) {

    this.selectedUserModel = user;
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-centered delete-modal-wrap',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  onConfirmDelete=()=>{

    this.userSvc.deleteUserAsync(this.selectedUserModel.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe((userResponse:any) => {
    console.log(userResponse);
    this.modalRef?.hide();
    this.search();
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
