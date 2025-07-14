import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PagedList } from 'src/app/models/common/paged-list';
import { ServiceRequestModel } from 'src/app/models/service-request-model';
import { PriorityPipe } from 'src/app/pipes/priority/priority.pipe';
import { ServiceRequestStatusPipe } from 'src/app/pipes/service-request-status/service-request-status.pipe';
import { ServiceRequestSearchRequestModel } from '../../../models/request/service-request-search-request-model';
import { ServiceRequestPriority } from '../../../models/service-request-priority';
import { ServiceRequestStatus } from '../../../models/service-request-status';
import { FormControl } from '@angular/forms';
import { SearchRequest, SearchType } from 'src/app/models/search';
import { AccountsPayable } from 'src/app/models/accounts-payable';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html'
})
export class ExpensesListComponent implements OnInit {

  readonly serviceRequestStatus = ServiceRequestStatus;
  readonly statuses = [
    ServiceRequestStatus.pendingApproval,
    ServiceRequestStatus.approved,
    ServiceRequestStatus.rejected,
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
          type: SearchType.expense,
          page: this.pageCtrl.value,
          pageSize: 10,
          keyword: search,
          status: status ? [status] : '',
        } as SearchRequest;
  
        if (!search) delete payload.keyword;
        if (!status) delete payload.status;
  
        return this.searchSvc
          .searchAsync<ServiceRequestModel>(payload, 'servicerequest')
          .pipe(
            tap(() => {
              this.isLoading$.next(false);
            })
          );
      })
    );

  @Input() expenseRequestPagedListModel: PagedList<ServiceRequestModel>;

  @Input() expenseRequestSearchRequestModel: ServiceRequestSearchRequestModel;

  @Input()
  public searchTerm: string;

  @Output()
  public OnChanged: EventEmitter<string> = new EventEmitter();

  public ServiceRequestStatus = ServiceRequestStatus;

  public ServiceRequestPriority = ServiceRequestPriority;

  private searchDebounce = new Subject<string>();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private cd: ChangeDetectorRef,
    private searchSvc: SearchService,
    private datePipe: DatePipe,
    private priorityPipe: PriorityPipe,
    private serviceRequestStatusPipe: ServiceRequestStatusPipe) { }

  ngOnInit(): void {

    // this.searchDebounce.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   takeUntil(this.ngUnSubscribe)
    // ).subscribe({
    //   next: (result) => {
    //     this.OnChanged.emit(this.searchTerm);
    //     this.markForCheck();
    //   }
    // });

  }

  trackByFn(index: number, item: ServiceRequestModel) {
    return item.id;
  }

  public searchByKeyword() {

    this.expenseRequestSearchRequestModel.page = 1;

    this.expenseRequestSearchRequestModel.pageSize = Math.floor(window.innerHeight / 70);

    this.searchDebounce.next(this.searchTerm);

    this.markForCheck();

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }


  onPageChanged(page: number): void {
    this.pageCtrl.setValue(page);
  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
