import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/** Models */

import { ServiceRequestModel } from '../../models/service-request-model';


/** Services */

import { InvoiceModel } from '../../models/invoice-model';
import { InvoiceStatus } from '../../models/invoice-status';

import { ServiceRequestType } from 'src/app/models/service-request-type';
import { FileModel } from 'src/app/models/file-model';
import { Helpers } from 'src/app/utils/helpers-util';

import { CompanyModel } from '../../models/company-model';
import { StoreModel } from '../../models/store-model';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AttachmentsListComponent } from '../attachments-list/attachments-list.component';
import * as html2pdf from 'html2pdf.js';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { ExpenseCategoryModel } from 'src/app/models/expense-category-model';

@Component({
  selector: 'invoice-template',
  templateUrl: './invoice-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoiceTemplateComponent implements OnInit, OnDestroy {

  @Input() invoiceData!: ServiceRequestModel;

  @ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;
  
  serviceRequestType = ServiceRequestType;

  public approvedInvoice: InvoiceModel;

  public FileHelper = Helpers;
  public isCreateInProgress: boolean;

  public InvoiceStatus = InvoiceStatus;

  @Output()
  public onApproved: EventEmitter<void> = new EventEmitter();
  public companies: CompanyModel[];

  public modalRef?: BsModalRef;

  public stores: StoreModel[];
  public categories: ExpenseCategoryModel[];

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private modalSvc: BsModalService,
    private expenseCategorySvc: ExpenseCategoryService,
  ) {

  }

  ngOnInit() {
    const category$ = this.expenseCategorySvc.getAsync();
    forkJoin([category$])
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(([categoryResult]) => {
        this.categories = categoryResult;
        this.markForCheck();
      });

      console.log("invoiceData>>>>>", this.invoiceData);
      
  }

  getStoreChunks(groups: any[], chunkSize: number = 3): any[][] {
    const chunks = [];
    for (let i = 0; i < groups.length; i += chunkSize) {
      chunks.push(groups.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async downloadPDF(): Promise<void> {
    const opt = {
      margin: [0, 0, 0.5, 0],
      filename: `${this.invoiceData?.id || 'invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    };

    await html2pdf().set(opt).from(this.invoiceContent.nativeElement).save();
  }

  getFormattedDateTime(): string {
    const now = new Date();

    const datePart = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(now);

    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);

    return `${datePart}, ${timePart}`;
  }


  public openModal(files: FileModel[]) {

    const initialState: ModalOptions = {
      initialState: {
        files: files
      },
      class: 'modal-body',
      ignoreBackdropClick: true
    };

    this.modalRef = this.modalSvc.show(AttachmentsListComponent, initialState);

    this.modalRef.content.onClosed.pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.modalRef.hide();

    });

  }

  public getItemCompany(id: string): string {
    return this.companies?.find(x => x.id === id)?.name;
  }
  public getItemCategory(id: string): string {
    return this.categories?.find(x => x.id === id)?.name;
  }

  public getItemStore(item: any): any {
    const storeId = item.stores[0].id;
    return this.stores?.find(x => x.id === storeId)?.name;
  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
