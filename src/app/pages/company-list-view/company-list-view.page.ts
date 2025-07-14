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
import { CompanyModel } from '../../models/company-model';
import { PagedList } from '../../models/common/paged-list';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';

/** Services */
import { CompanyService } from '../../services/company.service';
import { RoleConstant } from '../../models/role-constant';
import { UserModel } from '../../models/user-model';
import { ContextService } from '../../services/context.service';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'company-list-view',
  templateUrl: './company-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class CompanyListViewPage implements OnInit, OnDestroy {
@ViewChild('companyDetailTemplate') companyDetailTemplate!: TemplateRef<any>;

  public modalRef?: BsModalRef;
   
  public isLoading$ = new BehaviorSubject<boolean>(false);

  public searchTerm: string = "";

  public isHttpRequestInProcess: boolean;

  public companyPagedListModel: PagedList<CompanyModel>;

  public selectedCompanyModel: CompanyModel;

  private searchDebounce = new Subject<string>();
  
  public user: UserModel;

  public RoleConstant = RoleConstant;

  public companySearchRequestModel: CompanySearchRequestModel;

  private ngUnSubscribe: Subject<void> = new Subject<void>();


  constructor(private cd: ChangeDetectorRef, private contextSvc: ContextService,
    private companySvc: CompanyService, private datePipe: DatePipe, private modalSvc: BsModalService) { }

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

  trackByFn(index: number, item: any) {
    return item.id;
  }

  public search(): void {
  if (!this.companySearchRequestModel) {
    this.companySearchRequestModel = <CompanySearchRequestModel> {
      page: 1,
      pageSize: 10
    };
  }

  if (this.searchTerm?.length > 0) {
    this.companySearchRequestModel.keyword = this.searchTerm;
  } else {
    delete this.companySearchRequestModel.keyword;
  }

  this.isHttpRequestInProcess = true;
  this.isLoading$.next(true);

  this.companySvc.searchAsync(this.companySearchRequestModel)
    .pipe(takeUntil(this.ngUnSubscribe))
    .subscribe({
      next: (x) => {
        this.companyPagedListModel = x;
        if (!this.selectedCompanyModel && x.totalRecords > 0) {
          this.selectedCompanyModel = x.items[0];
        }
      },
      error: () => {
        // Optional: handle error
      },
      complete: () => {
        this.isLoading$.next(false);
        this.isHttpRequestInProcess = false;
        this.markForCheck();
      }
    });
}


  public searchByKeyword() {

    this.companySearchRequestModel.page = 1;
    this.companySearchRequestModel.pageSize = 10;

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }


public select(companyModel: CompanyModel): void {
  
    this.selectedCompanyModel = companyModel;
    
    const initialState: ModalOptions = {
      class: 'modal-dialog-right modal-lg',
      animated: true,
      initialState: {
        company: this.selectedCompanyModel
      }
    };
    
    this.modalRef = this.modalSvc.show(this.companyDetailTemplate, initialState);
    this.markForCheck();
  }

  public checkIfUserHasRole(roleId: string): boolean {

    return this.user && this.user.userRoles && this.user.userRoles.some(x => x.roleId === roleId);

  }


   public onPageChanged($event: any): void {

    if (this.companySearchRequestModel.page != $event.page) {

      this.companySearchRequestModel.page = $event.page;

      this.search();

    }

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  openModal(template: TemplateRef<any>, company: CompanyModel) {

    this.selectedCompanyModel = company;
    this.modalRef = this.modalSvc.show(template, {
      class: 'modal-dialog-centered delete-modal-wrap',
      ignoreBackdropClick: true,
      keyboard: false,
    });
  }

  onConfirmDelete=()=>{

    this.companySvc.deleteCompanyAsync(this.selectedCompanyModel.id).pipe(takeUntil(this.ngUnSubscribe)).subscribe((companyResponse:any) => {
    console.log(companyResponse);
    this.modalRef?.hide();
    this.search();
    });
  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
