import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/** Models */
import { PagedList } from '../../models/common/paged-list';

/** Services */
import { CommentService } from '../../services/comment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContextService } from '../../services/context.service';
import { ServiceRequestModel } from '../../models/service-request-model';
import { ServiceRequestSearchRequestModel } from '../../models/request/service-request-search-request-model';
import { ServiceRequestService } from '../../services/service-request.service';
import { DatePipe } from '@angular/common';
import { PriorityPipe } from 'src/app/pipes/priority/priority.pipe';
import { ServiceRequestStatusPipe } from 'src/app/pipes/service-request-status/service-request-status.pipe';

@Component({
  selector: 'service-request-list-view',
  templateUrl: './service-request-list-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PriorityPipe, ServiceRequestStatusPipe, DatePipe]
})

export class ServiceRequestListViewComponent implements OnInit, OnDestroy {

  public searchTerm: string = "";

  private searchDebounce = new Subject<string>();

  public isHttpRequestInProcess: boolean;

  public serviceRequestPagedListModel: PagedList<ServiceRequestModel>;

  public _serviceRequestSearchRequestModel: ServiceRequestSearchRequestModel;

  @Input()
  public set serviceRequestSearchRequestModel(serviceRequestSearchRequestModel: ServiceRequestSearchRequestModel) {

    this._serviceRequestSearchRequestModel = serviceRequestSearchRequestModel;

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

  public get serviceRequestSearchRequestModel() {

    return this._serviceRequestSearchRequestModel;

  }

  @Output()
  public onIsHttpRequestInProcess: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public onServiceRequestPagedListModel: EventEmitter<PagedList<ServiceRequestModel>> = new EventEmitter();

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private commentSvc: CommentService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private contextSvc: ContextService,
    private serviceRequestSvc: ServiceRequestService,
    private datePipe: DatePipe,
    private priorityPipe: PriorityPipe,
    private serviceRequestStatusPipe: ServiceRequestStatusPipe
  ) { }

  ngOnInit() {

  }

  private search(): void {

    this.isHttpRequestInProcess = true;

    this.onIsHttpRequestInProcess.emit(this.isHttpRequestInProcess);

    this.markForCheck();

    if (this.searchTerm && this.searchTerm.length > 0) {

      this.serviceRequestSearchRequestModel.keyword = this.searchTerm;

    }
    else {

      delete this.serviceRequestSearchRequestModel.keyword;

    }

    // this.serviceRequestSvc.searchAsync(this.serviceRequestSearchRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(x => {

    //   this.isHttpRequestInProcess = false;

    //   this.onIsHttpRequestInProcess.emit(this.isHttpRequestInProcess);

    //   this.serviceRequestPagedListModel = x;

    //   this.onServiceRequestPagedListModel.emit(this.serviceRequestPagedListModel);

    //   this.markForCheck();

    // });

  }


  public onPageChanged($event: any): void {

    if (this._serviceRequestSearchRequestModel.page != $event.page) {

      this._serviceRequestSearchRequestModel.page = $event.page;

      this.search();

    }

  }

  public searchByKeyword() {

    this.serviceRequestSearchRequestModel.page = 1;

    this.serviceRequestSearchRequestModel.pageSize = Math.floor(window.innerHeight / 70);

    this.searchDebounce.next(this.searchTerm);

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
