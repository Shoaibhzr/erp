import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PagedList } from 'src/app/models/common/paged-list';
import { ServiceRequestSearchRequestModel } from 'src/app/models/request/service-request-search-request-model';
import { ServiceRequestModel } from 'src/app/models/service-request-model';
import { ServiceRequestStatus } from 'src/app/models/service-request-status';
import { ServiceRequestType } from 'src/app/models/service-request-type';
import { PriorityPipe } from 'src/app/pipes/priority/priority.pipe';
import { ServiceRequestStatusPipe } from 'src/app/pipes/service-request-status/service-request-status.pipe';
import { ExpenseService } from 'src/app/services/expense.service';
import { ExceptionHandler } from 'src/app/utils/exceptions-handler';
import { ToasterService } from 'src/app/utils/toaster.service';

@Component({
  selector: 'app-expenses-filter',
  templateUrl: './expenses-filter.component.html'
})

export class ExpensesFilterComponent implements OnInit {

  public expenseRequestPagedListModel: PagedList<ServiceRequestModel>;
  public isHttpRequestInProcess: boolean = false;
  public expenseRequestSearchRequestModel: ServiceRequestSearchRequestModel;
  public ExpenseRequestStatus = ServiceRequestStatus;
  public searchTerm: string = "";

  constructor(private expenseService: ExpenseService, private toasterService: ToasterService,
    private datePipe: DatePipe,
    private priorityPipe: PriorityPipe,
    private serviceRequestStatusPipe: ServiceRequestStatusPipe
  ) { }

  ngOnInit(): void {

    this.search("");

  }

  public search($event: any) {

    if (!this.expenseRequestSearchRequestModel) {

      this.expenseRequestSearchRequestModel = <ServiceRequestSearchRequestModel>{ page: 1, pageSize: Math.floor(window.innerHeight / 70), type: ServiceRequestType.expense };

    }

    this.searchTerm = $event;

    if ($event && $event.length > 0) {

      this.expenseRequestSearchRequestModel.keyword = $event;

    }
    else {

      delete this.expenseRequestSearchRequestModel.keyword;

    }

    this.getExpenseList(this.expenseRequestSearchRequestModel)

  }

  public filteredData() {
    if (!this.searchTerm) {
      return this.expenseRequestPagedListModel.items; // If no search term, return all data
    }

    return this.expenseRequestPagedListModel.items.filter(row =>
      row.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.item?.toString().includes(this.searchTerm) ||
      row.store?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.createdBy?.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.createdBy?.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.priorityPipe.transform(row.priority).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.serviceRequestStatusPipe.transform(row.status).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      this.datePipe.transform(row.createdOn, 'MMM d, y, h:mm a').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  public filter(status: ServiceRequestStatus[]) {
    this.expenseRequestSearchRequestModel.status = status;
    this.expenseRequestSearchRequestModel.page = 1;
    this.getExpenseList(this.expenseRequestSearchRequestModel);
  }

  public checkIfStatusSelected(ExpenseRequestStatus: ServiceRequestStatus): boolean {
    return this.expenseRequestSearchRequestModel?.status && this.expenseRequestSearchRequestModel.status.some((x: string) => x === ExpenseRequestStatus);
  }

  private getExpenseList(expenseRequestSearchRequestModel: ServiceRequestSearchRequestModel) {
    this.isHttpRequestInProcess = true;
    this.expenseRequestPagedListModel = null;
    this.expenseService.searchByAsync(expenseRequestSearchRequestModel).subscribe({
      next: (response: any) => {
        this.isHttpRequestInProcess = false;
        this.expenseRequestPagedListModel = response
      },
      error: (error) => {
        this.toasterService.showError(ExceptionHandler.getExceptionMessage(error) ?? 'Error getting expenses')
        this.isHttpRequestInProcess = false;
      }
    })
  }
}
