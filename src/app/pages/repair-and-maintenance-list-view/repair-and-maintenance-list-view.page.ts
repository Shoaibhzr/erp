import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';

/** Models */
import { CompanyModel } from '../../models/company-model';
import { PagedList } from '../../models/common/paged-list';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';

/** Services */
import { CompanyService } from '../../services/company.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { ServiceRequestModel } from '../../models/service-request-model';
import { ServiceRequestSearchRequestModel } from '../../models/request/service-request-search-request-model';
import { ServiceRequestStatus } from '../../models/service-request-status';
import { ServiceRequestType } from '../../models/service-request-type';
import { UserService } from '../../services/user.service';
import { FormControl } from '@angular/forms';
import { AccountsPayable } from 'src/app/models/accounts-payable';
import { SearchType, SearchRequest } from 'src/app/models/search';

@Component({
  selector: 'repair-and-maintenance-list-view',
  templateUrl: './repair-and-maintenance-list-view.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RepairAndMaintenanceListViewPage implements OnInit, OnDestroy {

   readonly serviceRequestStatus = ServiceRequestStatus;
    readonly statuses = [
      ServiceRequestStatus.pendingApproval,
      ServiceRequestStatus.approved,
      ServiceRequestStatus.quotationRequested,
      ServiceRequestStatus.inProgress,
      ServiceRequestStatus.issueResolved,
      ServiceRequestStatus.awaitingInvoiceApproval,
      ServiceRequestStatus.paymentPending,
    ];
    isLoading$ = new BehaviorSubject<boolean>(false);
    refetch$ = new BehaviorSubject<boolean>(false);
    searchCtrl = new FormControl('');
    statusCtrl = new FormControl('');
    pageCtrl = new FormControl(1);
    private searchTerm$ = this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.pageCtrl.setValue(1, { emitEvent: false }))
    );
    private status$ = this.statusCtrl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      tap(() => this.pageCtrl.setValue(1, { emitEvent: false }))
    );
    private page$ = this.pageCtrl.valueChanges.pipe(
      startWith(1),
      distinctUntilChanged()
    );
    list$ = combineLatest([
      this.searchTerm$,
      this.status$,
      this.page$,
      this.refetch$,
    ]).pipe(
      debounceTime(50),
      tap(() => {
        this.isLoading$.next(true);
      }),
      switchMap(([search, status, _page, _reFetch]) => {
        const payload = {
          type: SearchType.repairAndMainenance,
          page: this.pageCtrl.value,
          pageSize: 10,
          keyword: search,
          status: status ? [status] : '',
        } as SearchRequest;
  
        if (!search) delete payload.keyword;
        if (!status) delete payload.status;
  
        return this.serviceRequestSvc.searchRepairAsync<ServiceRequestModel>(payload)
          .pipe(
            tap(() => {
              this.isLoading$.next(false);
            })
          );
      })
    );

  public isHttpRequestInProcess: boolean;

  public serviceRequestPagedListModel: PagedList<ServiceRequestModel>;

  public selectedServiceRequestModel: ServiceRequestModel;

  public serviceRequestSearchRequestModel: ServiceRequestSearchRequestModel;

  public ServiceRequestStatus = ServiceRequestStatus;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private serviceRequestSvc: ServiceRequestService, private userSvc: UserService) {

  }

  ngOnInit() {

    this.isHttpRequestInProcess = true;

    this.markForCheck();

    this.search();

  }

  onPageChanged(page: number): void {
    this.pageCtrl.setValue(page);
  }

  private search() {

    if (!this.serviceRequestSearchRequestModel) {

      this.serviceRequestSearchRequestModel = <ServiceRequestSearchRequestModel>{ page: 1, pageSize: Math.floor(window.innerHeight / 70), type: ServiceRequestType.repairAndMainenance };

    }

    this.serviceRequestSearchRequestModel = { ...this.serviceRequestSearchRequestModel };

  }

  public select(serviceRequestModel: ServiceRequestModel): void {

    this.selectedServiceRequestModel = serviceRequestModel;

    this.markForCheck();

  }

  public all(): void {

    this.serviceRequestSearchRequestModel.status = [];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public pendingApprovals(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.pendingApproval];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public approved(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.approved];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public quotationRequested(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.quotationRequested];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public inProgress(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.inProgress];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public workCompleted(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.issueResolved];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public pendingInvApprovals(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.awaitingInvoiceApproval];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public pendingPayments(): void {

    this.serviceRequestSearchRequestModel.status = [ServiceRequestStatus.paymentPending];

    this.serviceRequestSearchRequestModel.page = 1;

    this.search();

  }

  public checkIfStatusSelected(serviceRequestStatus: ServiceRequestStatus): boolean {

    return this.serviceRequestSearchRequestModel.status && this.serviceRequestSearchRequestModel.status.some(x => x === serviceRequestStatus);

  }

  public onIsHttpRequestInProcess($event: boolean): void {
    
    this.isHttpRequestInProcess = $event;

    this.markForCheck();

  }

  public onServiceRequestPagedListModel($event: PagedList<ServiceRequestModel>): void {
    
    this.serviceRequestPagedListModel = $event;

    this.markForCheck();

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
