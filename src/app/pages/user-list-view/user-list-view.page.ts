import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/** Models */
import { PagedList } from '../../models/common/paged-list';
import { UserModel } from '../../models/user-model';
import { UserSearchRequestModel } from '../../models/request/user-search-request-model';

/** Services */
import { UserService } from '../../services/user.service';

/** Pipes */
import { DatePipe } from '@angular/common';
import { UserRolesToRolePipe } from 'src/app/pipes/user-roles-to-role/user-roles-to-role.pipe';
import { UserRolesToCompanyPipe } from 'src/app/pipes/user-roles-to-company/user-roles-to-company.pipe';
import { UserRolesToStorePipe } from 'src/app/pipes/user-roles-to-store/user-roles-to-store.pipe';
import { UserRoleModel } from '../../models/user-role-model';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'user-list-view',
  templateUrl: './user-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserRolesToRolePipe, UserRolesToCompanyPipe, UserRolesToStorePipe, DatePipe] 
})

export class UserListViewPage implements OnInit, OnDestroy {
  @ViewChild('userDetailTemplate') userDetailTemplate!: TemplateRef<any>;
  
  modalRef?: BsModalRef;

  public isHttpRequestInProcess: boolean;

  public userPagedListModel: PagedList<UserModel>;

  public selectedUserModel: UserModel;

  public searchTerm: string = "";

  public userForDelete:any;

  public storeGroups:string[];

  public stores:string[];

  private searchDebounce = new Subject<string>();

  public userSearchRequestModel: UserSearchRequestModel;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private userSvc: UserService,
    private userRolesToRolePipe: UserRolesToRolePipe,
    private userRolesToCompanyPipe: UserRolesToCompanyPipe,
    private userRolesToStore: UserRolesToStorePipe,
    private datePipe: DatePipe,
    private modalSvc: BsModalService
  ) {}

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

    if (!this.userSearchRequestModel) {

      this.userSearchRequestModel = <UserSearchRequestModel>{ page: 1, pageSize: 10, userTypeSearch: 'User' };

    }

    if (this.searchTerm && this.searchTerm.length > 0) {

      this.userSearchRequestModel.keyword = this.searchTerm;

    }
    else {

      delete this.userSearchRequestModel.keyword;

    }

    this.userSvc.searchAsync(this.userSearchRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(x => {

      this.userPagedListModel = x;
 
      if (!this.selectedUserModel) {

        if (this.userPagedListModel.totalRecords > 0) {

          this.selectedUserModel = this.userPagedListModel.items[0];

        }

      }

      this.isHttpRequestInProcess = false;

      this.markForCheck();

    });

  }

  public getStores(userRoles: UserRoleModel[]) : string {
    return userRoles?.map(x => x.store?.name).join(", "); 
  }

  public searchByKeyword() {

    this.userSearchRequestModel.page = 1;
    this.userSearchRequestModel.pageSize = 10;

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }


  public select(user: UserModel): void {
  
    this.selectedUserModel = user;
    this.stores=(user.userRoles.length > 0) ? user.userRoles.filter(x => x.store != null).map(x => x.store.name):undefined;
    this.storeGroups=(user.userRoles.length > 0) ? user.userRoles.filter(x => x.group != null).map(x => x.group.name):undefined;
    const initialState: ModalOptions = {
      class: 'modal-dialog-right modal-lg',  // Use modal-lg for 50% width
      animated: true,
      initialState: {
        user: this.selectedUserModel
      }
    };
    
    this.modalRef = this.modalSvc.show(this.userDetailTemplate, initialState);
    this.markForCheck();
  }

  public onPageChanged($event: any): void {

    if (this.userSearchRequestModel.page != $event.page) {

      this.userSearchRequestModel.page = $event.page;

      this.search();

    }

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

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

}
