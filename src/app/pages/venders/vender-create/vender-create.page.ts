import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
declare var bootstrap: any;

/** Models */

import { PagedList } from 'src/app/models/common/paged-list';
import { CompanyModel } from 'src/app/models/company-model';
import { CompanySearchRequestModel } from 'src/app/models/request/company-search-request-model';
import { StoreSearchRequestModel } from 'src/app/models/request/store-search-request-model';
import { RoleConstant } from 'src/app/models/role-constant';
import { RoleModel } from 'src/app/models/role-model';
import { StoreModel } from 'src/app/models/store-model';
import { UserModel } from 'src/app/models/user-model';

/** Services */

import { VendorService } from 'src/app/services/vendor.service';
import { VendorSearchRequestModel } from 'src/app/models/request/vendor-search-request-model';
import { EmailValidator } from 'src/app/validators/email.validator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { ConfirmPasswordValidator } from 'src/app/validators/confirm-password.validator';
import { UserSearchRequestModel } from 'src/app/models/request/user-search-request-model';
import { CompanyService } from 'src/app/services/company.service';
import { ContextService } from 'src/app/services/context.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';



@Component({
  selector: 'vender-create',
  templateUrl: './vender-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenderCreatePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('template') modalTemplate!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('updateFileInput') updateFileInput: ElementRef<HTMLInputElement>;

  public id: string;

  public companyPagedListModel: PagedList<CompanyModel>;

  public storePagedListModel: PagedList<StoreModel>;

  public stores: StoreModel[] = []; // Initialize as empty array

  public auditorStores: StoreModel[] = [];

  public roles: RoleModel[];

  public form!: FormGroup;

  public isInitInProgress: boolean;

  public isCreateRequestInProgress: boolean;

  public file: File;

  public selectedCompanies: CompanyModel[];

   public vendorSubArray: any[];

  public fileDataUrl: string;

  public RoleConstant = RoleConstant;

  public userToEdit: UserModel;

  public isVender: boolean = false;

  public passwordVisible: boolean = false;

  public confirmPasswordVisible: boolean = false;

  public user: UserModel;

  private users: UserModel[];

  public hasRights: boolean;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  public modalRef?: BsModalRef;

  public selectedGroupIds: string[] = [];

  public duplicateRoleMsg: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private companySvc: CompanyService,
    private userSvc: UserService,
    private venderSvc: VendorService,
    private storeSvc: StoreService,
    private contextSvc: ContextService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.initForm();

    this.id = this.route.snapshot.params['id'];

    this.user = this.contextSvc.user.getValue();

    this.getVendorSubsidiary();

   
    // hiding/displaying role and company option based on the type of user which
    const path = this.router.url;
    const pathSegments = path.split('/');
    if (pathSegments.length > 0) {
      if (pathSegments[1] === 'vendors')
        //getting the second segment from url which can be users or venders
        this.isVender = true; //setting the boolean to true if the component is being loaded for vender creation
    }

    if (this.isVender) {
      //if there is id in params then its a vendor edit case else create new vendor
      if (this.id) {
        this.searchVendor();
      } else {
        //setting the static vender role Id
        this.isInitInProgress = false;
        this.form.get('roleId').setValue([RoleConstant.vendorId]);

      }
    } else {
      //fetching company and roles when component is being loaded for user creation
      this.isInitInProgress = true;
      this.markForCheck();
      this.filterRoleOptions();
      this.populateCompaniesList();
    }
  }

  checkRights = () => {
    this.hasRights = this.user.userRoles.some(
      (x) =>
        x.roleId === RoleConstant.companyAdminId ||
        x.roleId === RoleConstant.srDirectorOperations ||
        x.roleId === RoleConstant.directorOperations ||
        x.roleId === RoleConstant.supervisor ||
        x.roleId === RoleConstant.generalManager ||
        x.roleId === RoleConstant.employeeId ||
        x.roleId === RoleConstant.accountsPayableManager ||
        x.roleId === RoleConstant.auditorId
    );
  };

 
  public create(): void {
    if (!this.form.valid) {
      this.markForCheck();

      return;
    }

    this.isCreateRequestInProgress = true;

    this.markForCheck();

    new Observable<void>((observer) => {
      if (this.file) {
        const fd = new FormData();

        fd.append('File', this.file);

        this.userSvc
          .uploadProfilePictureAsync(fd)
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe((x) => {
            this.form.get('profilePictureWebUrl').patchValue(x.uri);

            observer.next(null);

            observer.complete();
          });
      } else {
        observer.next(null);

        observer.complete();
      }
    })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(() => {
        new Observable<void>((observer) => {
          if (this.id) {
            const payload = this.form.getRawValue();

            this.userSvc
              .updateAsync(payload)
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe(
                () => {
                  observer.next(null);

                  observer.complete();
                },
                (error) => {
                  observer.error(error);
                }
              );
          } else {
            const payload = this.form.getRawValue();

            this.userSvc
              .createAsync(payload)
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe(
                () => {
                  observer.next(null);

                  observer.complete();
                },
                (error) => {
                  observer.error(error);
                }
              );
          }
        })
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe(
            () => {
              if (this.isVender) {
                this.router.navigateByUrl('/vendors/list');
              } 

              this.markForCheck();
            },
            () => {
              this.isCreateRequestInProgress = false;

              this.markForCheck();
            }
          );
      });
  }

  public onFileSelected(event: any): void {
    this.file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {
      this.fileDataUrl = reader.result.toString();

      this.markForCheck();
    };

    reader.readAsDataURL(this.file);

    this.markForCheck();
  }

  public deleteProfilePicture(): void {
    delete this.file;
    delete this.fileDataUrl;
    delete this.userToEdit.profilePictureWebUrl;
  
    this.form.get('profilePictureWebUrl').setValue(undefined);
  
    // Reset file input and update input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    if (this.updateFileInput?.nativeElement) {
      this.updateFileInput.nativeElement.value = '';
    }
  
    this.markForCheck();
  }
  

  private markForCheck(): void {
    this.cd.markForCheck();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  private initForm() {
    this.form = this.fb.group(
      {
        id: [null],
        businessName: [null, [Validators.required, Validators.maxLength(50)]],
        firstName: [null, [Validators.required, Validators.maxLength(50)]],
        lastName: [null, [Validators.required, Validators.maxLength(50)]],
        email: [
          null,
          [
            Validators.required,
            Validators.maxLength(50),
            Validators.email,
            EmailValidator.pattern(
              /^[a-z0-9_]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/gi
            ),
          ],
        ],
        phone: [null, [Validators.required, Validators.maxLength(15)]],
        password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
        confirmPassword: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
        roleId: [[], [Validators.required]],
        profilePictureWebUrl: [null],
        subsidiary: [[],Validators.required],
        
      },
      {
        validator: ConfirmPasswordValidator('password', 'confirmPassword'),
      }
    );
  }

  onSubChanged() {
  const selectedIds = this.form.get('subsidiary')?.value;

}


  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 30) {
      input.value = input.value.slice(0, 30);
      this.form.get('password')?.setValue(input.value);
    }
  }

  public getVendorSubsidiary() {
  this.isInitInProgress = true;

  this.venderSvc.getSubsidiaryAsync().subscribe({
    next: (res) => {
      this.isInitInProgress = false;
      this.vendorSubArray = res;
    },
    error: (err) => {
      this.isInitInProgress = false;
      console.error('Error fetching subsidiaries:', err);
      // this.toastr.showError('Error fetching subsidiaries');
    },
  });
}


  private searchVendor() {
    forkJoin([
      this.userSvc.searchAsync(<UserSearchRequestModel>{ ids: [this.id], userTypeSearch: 'Vendor' }),
      this.venderSvc.getSubsidiaryAsync()
    ])
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(([userRes, subs]) => {
        this.vendorSubArray = subs;

        if (userRes.totalRecords > 0) {
          this.userToEdit = userRes.items[0];

          const user = {
            id: this.userToEdit.id,
            profilePictureWebUrl: this.userToEdit.profilePictureWebUrl,
            businessName: this.userToEdit.businessName,
            firstName: this.userToEdit.firstName,
            lastName: this.userToEdit.lastName,
            email: this.userToEdit.email,
            password: this.userToEdit.password,
            confirmPassword: this.userToEdit.password,
            phone: this.userToEdit.phone,
            roleId: this.userToEdit.userRoles.map((r: any) => String(r.roleId)),
            subsidiary: this.userToEdit.subsidiaries?.map(s => s.id),
          };

          this.form.patchValue(user);
          this.markForCheck();
        }
      });



  }

  private populateCompaniesList() {
    this.companySvc
      .searchAsync(<CompanySearchRequestModel>{ page: 1, pageSize: 100000 })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((companies) => {
        this.companyPagedListModel = companies;

        this.hasRights=true;

        this.selectedCompanies = companies.items;

        const userSearchRequestModel = new UserSearchRequestModel();

        userSearchRequestModel.page = 1;
        userSearchRequestModel.pageSize = 10000000;
        this.id = this.route.snapshot.params['id'];
            this.storeSvc
              .searchAsync(<StoreSearchRequestModel>{
                page: 1,
                pageSize: 1,
              })
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe((stores) => {
                this.storePagedListModel = stores;

                new Observable<void>((observer) => {
               

                  if (this.id) {
                    this.userSvc
                      .searchAsync(<UserSearchRequestModel>{ ids: [this.id],page: 1, pageSize: 1 })
                      .pipe(takeUntil(this.ngUnSubscribe))
                      .subscribe(
                        (x) => {
                          if (x.totalRecords > 0) {
                            this.userToEdit = x.items[0];
                          }

                          observer.next(null);

                          observer.complete();
                        },
                        (error) => {
                          observer.error(error);
                        }
                      );
                  } else {
                    observer.next(null);

                    observer.complete();
                  }
                })
                  .pipe(takeUntil(this.ngUnSubscribe))
                  .subscribe(
                    () => {
                 
                      if (
                        this.userToEdit &&
                        this.userToEdit.userRoles.length > 0
                      ) {
                        const user = {
                          id: this.userToEdit.id,
                          profilePictureWebUrl:
                            this.userToEdit.profilePictureWebUrl,
                          firstName: this.userToEdit.firstName,
                          lastName: this.userToEdit.lastName,
                          email: this.userToEdit.email,
                          phone: this.userToEdit.phone,
                          password: this.userToEdit.password,
                          confirmPassword: this.userToEdit.password,
                          roleId: this.userToEdit.userRoles
                            .filter((x) => x.roleId != null)
                            .map((x) => x.roleId),
                          
                         
                        };

                        this.form.patchValue(user);

                       
                      } 

                      this.isInitInProgress = false;

                      this.markForCheck();
                    },
                    () => {
                      this.isInitInProgress = false;

                      this.markForCheck();
                    }
                  );
              });
          });
  }

  private filterRoleOptions() {
    if (
      this.user.userRoles.some((x) => x.roleId == RoleConstant.globalAdminId)
    ) {
      this.roles = [
        <RoleModel>{ id: RoleConstant.globalAdminId, name: 'Global Admin' },
        <RoleModel>{ id: RoleConstant.companyAdminId, name: 'Company Admin' },
        <RoleModel>{
          id: RoleConstant.srDirectorOperations,
          name: 'Sr. Director of Operations',
        },
        <RoleModel>{
          id: RoleConstant.directorOperations,
          name: 'Director of Operations',
        },
        <RoleModel>{ id: RoleConstant.supervisor, name: 'Supervisor' },
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
        <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
        <RoleModel>{ id: RoleConstant.vpOperations, name: 'VPOperations' },
         <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
      ];
    } else if (
      this.user.userRoles.some((x) => x.roleId == RoleConstant.companyAdminId)
    ) {
      this.roles = [
        <RoleModel>{ id: RoleConstant.companyAdminId, name: 'Company Admin' },
        <RoleModel>{
          id: RoleConstant.srDirectorOperations,
          name: 'Sr. Director of Operations',
        },
        <RoleModel>{
          id: RoleConstant.directorOperations,
          name: 'Director of Operations',
        },
        <RoleModel>{ id: RoleConstant.supervisor, name: 'Supervisor' },
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
        <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
        <RoleModel>{ id: RoleConstant.vpOperations, name: 'VPOperations' },
      ];
    } else if (
      this.user.userRoles.some(
        (x) => x.roleId == RoleConstant.srDirectorOperations
      )
    ) {
      this.roles = [
        <RoleModel>{
          id: RoleConstant.srDirectorOperations,
          name: 'Sr. Director of Operations',
        },
        <RoleModel>{
          id: RoleConstant.directorOperations,
          name: 'Director of Operations',
        },
        <RoleModel>{ id: RoleConstant.supervisor, name: 'Supervisor' },
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
         <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
          <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
      ];
    } else if (
      this.user.userRoles.some(
        (x) => x.roleId == RoleConstant.directorOperations
      )
    ) {
      this.roles = [
        <RoleModel>{
          id: RoleConstant.directorOperations,
          name: 'Director of Operations',
        },
        <RoleModel>{ id: RoleConstant.supervisor, name: 'Supervisor' },
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
         <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
          <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
      ];
    } else if (
      this.user.userRoles.some((x) => x.roleId == RoleConstant.supervisor)
    ) {
      this.roles = [
        <RoleModel>{ id: RoleConstant.supervisor, name: 'Supervisor' },
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
         <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
          <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
      ];
    } else if (
      this.user.userRoles.some((x) => x.roleId == RoleConstant.generalManager)
    ) {
      this.roles = [
        <RoleModel>{ id: RoleConstant.generalManager, name: 'General Manager' },
        <RoleModel>{ id: RoleConstant.employeeId, name: 'Employee' },
         <RoleModel>{
          id: RoleConstant.accountsPayableManager1,
          name: 'AccountsPayableManager1',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableManager2,
          name: 'AccountsPayableManager2',
        },
        <RoleModel>{
          id: RoleConstant.accountsPayableCreator,
          name: 'AccountsPayableCreator',
        },
          <RoleModel>{ id: RoleConstant.auditor1, name: 'Auditor1' },
        <RoleModel>{ id: RoleConstant.auditor2, name: 'Auditor2' },
      ];
    }
  }

  ngAfterViewInit() {
    // Initialize all tooltips
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  openCreateModal(template: TemplateRef<any>) {
    if (this.form.valid) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-dialog-centered user-create-modal',
        ignoreBackdropClick: true,
        keyboard: false,
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }
  

  confirmCreate() {
    this.create();
    this.modalRef?.hide();
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const key = event.key;
  
    if (!/^\d$/.test(key) && key !== '+' && !allowedKeys.includes(key)) {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();
  }
  
}
