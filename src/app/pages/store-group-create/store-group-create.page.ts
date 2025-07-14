import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';
import { PagedList } from 'src/app/models/common/paged-list';
import { CompanyModel } from 'src/app/models/company-model';
import { CompanySearchRequestModel } from 'src/app/models/request/company-search-request-model';
import { RoleConstant } from 'src/app/models/role-constant';
import { CompanyService } from 'src/app/services/company.service';
import { ContextService } from 'src/app/services/context.service';
import { StoreService } from 'src/app/services/store.service';
import { ExceptionHandler } from 'src/app/utils/exceptions-handler';
import { ToasterService } from 'src/app/utils/toaster.service';

@Component({
  selector: 'store-group-create',
  templateUrl: './store-group-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreGroupCreatePage implements OnInit {
  public id: string;
  public companies: any[] = [];
  public stores: any[] = [];
  public form!: FormGroup;
  public isInitInProgress: boolean = false;
  public modalRef?: BsModalRef;
  public selectedStore:any;
  storeGroups: any[] = [];
  user:any;
  public searchRequest: any = {
    page: 1,
    pageSize: 1000000000000000,
    type: 'store',
    ids: [],
    companyIds: [],
    Keyword: '',
  };
  
  private ngUnSubscribe: Subject<void> = new Subject<void>();

  public companyPagedListModel: PagedList<CompanyModel>;

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private storeSvc: StoreService,
    private companySvc: CompanyService,
    private contextSvc: ContextService,
    private router: Router,
    private toasterService: ToasterService,
    private location: Location
  ) {}

  ngOnInit() {

    this.initForm();
    this.populateCompaniesList();
    this.id = this.route.snapshot.params["id"];
    this.user = this.contextSvc.user.getValue();
      if(this.id && this.user) {
        this.search()

      } 
  

    this.form.get('companyId').valueChanges.subscribe((data)=>{
      this.form.get('storeIds')?.setValue([]);
      this.getStores(data);
    })

  }

  onstoreSelected=(event:any)=>{

    this.checkStore(event[event.length-1].id);
  }

  private initForm() {
    this.form = this.fb.group({
      id: [null],
      companyId: [null, Validators.required],
      name: [null, [Validators.required, Validators.maxLength(50)]],
      storeIds: [[], Validators.required],
      description:[null, Validators.maxLength(1024)]
    });
  }

   get description(): string {
  return this.form.get('description')?.value || '';
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

    this.searchRequest.pageSize=1000000;
    this.searchRequest.page=1;
    this.searchRequest.type="store";
    this.searchRequest.ids=[this.id];
    this.searchRequest.Keyword="";

    this.storeSvc
      .searchStoreGroupsAsync(this.searchRequest)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((companies: any) => {
        this.storeGroups = companies.items;
        console.log(this.storeGroups);
        this.getStores(this.storeGroups[0].companies[0].id);
        const storeGroup = {
          id: this.storeGroups[0].id,
          companyId: this.storeGroups[0].companies[0].id,
          name: this.storeGroups[0].name,
          storeIds: this.storeGroups[0].stores.map((store: any) => store.id),
          description: this.storeGroups[0].description,
          
        };
        this.form.patchValue(storeGroup);
        this.getStores(this.storeGroups[0].companies[0].id);
        this.cd.markForCheck();
      });
  }

  public openCreateModal(template: any) {
    if (this.form.valid) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-dialog-centered user-create-modal',
        ignoreBackdropClick: true,
        keyboard: false
      });
    }
  }

    private populateCompaniesList() {
  
      this.companySvc.searchAsync(<CompanySearchRequestModel>{ page: 1, pageSize: 100000 }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(companies => {
  
        this.companyPagedListModel = companies;

        this.cd.markForCheck();
      });
    }

    getStores=(companyId:any)=>{
    
          this.searchRequest.pageSize=1000000;
          this.searchRequest.page=1;
          this.searchRequest.type="store";
          this.searchRequest.ids=[];
          this.searchRequest.Keyword="";
          this.searchRequest.companyIds=[companyId];

          this.storeSvc.getStoresOnCompanyId(this.searchRequest).pipe(takeUntil(this.ngUnSubscribe)).subscribe((storeData:any) => {
        
            console.log(storeData);
            this.stores=storeData.items;
            console.log(this.stores);
            this.cd.markForCheck();
      
          });
    }

    checkStore=(storeId:any)=>{
      this.selectedStore=storeId;
      this.storeSvc.checkStoreAsync(storeId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe({
        next: (storeData: any) => {
          this.form.get('storeIds').patchValue(this.form.get('storeIds').value.filter((item:any) => item !== this.selectedStore));
          this.toasterService.showError('This store already exists in another store group.')
        },
        error: (err) => {
          console.error('Server error:', err);
          // Handle the error here: show message, redirect, etc.
        },
        complete: () => {
          console.log('Request complete');
        }
      });
    }

    public create(): void {

   
      if (!this.form.valid) {
  
        this.markForCheck();
  
        return;
  
      }

      this.confirmCreate();

      this.markForCheck();

      if (this.id) {

        const updateRequestModel = this.form.getRawValue();

        updateRequestModel.type="store";

        this.storeSvc.updateStoreGroupAsync(updateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

          (data) => {
            this.router.navigateByUrl("store-groups/list");
          },
          (error) => {

           

          }

        );

      }
      else {

        const createRequestModel = this.form.getRawValue();

        createRequestModel.type="store";

        this.storeSvc.createStoreGroupAsync(createRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

          (data) => {

            this.router.navigateByUrl("store-groups/list");

          },
          (error) => {

           

          }

        );

      }
    }



  public confirmCreate() {
    // Implement create logic
    this.modalRef?.hide();
  }

  public goBack() {
    this.location.back();
  }

  private markForCheck() {
    this.cd.markForCheck();
  }
}