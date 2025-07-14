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

import { RoleModel } from '../../models/role-model';
import { UserModel } from '../../models/user-model';
import { StoreModel } from '../../models/store-model';
import { CompanyModel } from '../../models/company-model';
import { RoleConstant } from '../../models/role-constant';
import { PagedList } from '../../models/common/paged-list';
import { StoreSearchRequestModel } from '../../models/request/store-search-request-model';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';

/** Services */
import { UserService } from '../../services/user.service';
import { StoreService } from '../../services/store.service';
import { CompanyService } from '../../services/company.service';
import { ContextService } from '../../services/context.service';
import { UserSearchRequestModel } from '../../models/request/user-search-request-model';
import { VendorService } from 'src/app/services/vendor.service';
import { VendorSearchRequestModel } from 'src/app/models/request/vendor-search-request-model';
import { EmailValidator } from 'src/app/validators/email.validator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { ConfirmPasswordValidator } from 'src/app/validators/confirm-password.validator';
import { StoreRoleModel } from 'src/app/models/store-role-model';
import { ToasterService } from 'src/app/utils/toaster.service';


@Component({
  selector: 'user-create',
  templateUrl: './user-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePage implements OnInit, OnDestroy, AfterViewInit {
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

  public storeGroupsArray: any[];
  public auditorStoreGroupsArray: any[];

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

  public disableRoles = true;

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
    private modalService: BsModalService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.initForm();

    this.form.get('companyId')?.valueChanges.subscribe((companyId) => {
    const roleControl = this.form.get('roleId');
    if (companyId) {
      roleControl?.enable();
    } else {
      roleControl?.disable();
      roleControl?.reset();
    }
  });

    this.form.get('email')?.valueChanges.subscribe(() => {
      const emailControl = this.form.get('email');
      if (emailControl?.hasError('emailExists')) {
        emailControl.setErrors(null);
      }
    });

    this.form.get('phone')?.valueChanges.subscribe(() => {
      const phoneControl = this.form.get('phone');
      if (phoneControl?.hasError('phoneExists')) {
        phoneControl.setErrors(null);
      }
    });



    this.id = this.route.snapshot.params['id'];

    this.user = this.contextSvc.user.getValue();

    this.checkRights();

    // if (this.user && this.user.userRoles.length > 0) {
    //   this.user.userRoles[0].company && this.user.userRoles[0].company.id
    //     ? this.storeGroups(this.user.userRoles[0].company.id)
    //     : undefined;
    // }
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
        this.form.get('roleId').setValue(RoleConstant.vendorId);
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

  checkRoles(roleId: string, companyId: string, template: TemplateRef<any>) {
    const payload = {
      roleId: roleId,
      companyId: companyId
    };
  
    this.userSvc.checkDuplicateRole(payload).subscribe((res: any) => {
      
        let roleName = '';
        switch (roleId) {
          case RoleConstant.companyAdminId:
            roleName = 'Company Admin';
            break;
          case RoleConstant.accountsPayableManager1:
            roleName = 'Accounts Payable Manager 1';
            break;
          case RoleConstant.accountsPayableManager2:
            roleName = 'Accounts Payable Manager 2';
            break;
          case RoleConstant.auditor2:
            roleName = 'Auditor 2';
            break;
        }
  
        if (roleName) {
          const message = `<strong>${roleName}</strong> against this company is already created. If you want to create a new <strong>${roleName}</strong>, then the previous <strong>${roleName}</strong> needs to be deleted.`;

          const currentRoles: string[] = this.form.get('roleId')?.value || [];
          this.form.get('roleId')?.setValue(currentRoles.filter(r => r !== roleId));

          this.openDuplicateRoleModal(message, template);
        }
    });
  }

 checkStoreRoles(roleId: string, companyId: string, storeIds: string[], template: TemplateRef<any>) {
  const payload: StoreRoleModel = {
    RoleId: roleId,
    StoreIds: storeIds,
    CompanyId: companyId
  };

  this.userSvc.checkStoreRole(payload).subscribe((res: any[]) => {
    if (res && Array.isArray(res) && res.length > 0) {
      let roleName = '';
      switch (roleId) {
        case RoleConstant.vpOperations:
          roleName = 'Vice President'; break;
        case RoleConstant.srDirectorOperations:
          roleName = 'Senior District Operations'; break;
        case RoleConstant.directorOperations:
          roleName = 'District Operations'; break;
        case RoleConstant.generalManager:
          roleName = 'General Manager'; break;
        case RoleConstant.supervisor:
          roleName = 'Area Supervisor'; break;
      }

      // Get the store names from response
      const duplicateStoreNames = res.map(store => store.name).join(', ');
      const duplicateStoreIds = res.map(store => store.id);

      // Remove only the duplicated store IDs from the form
      const currentStoreIds: string[] = this.form.get('storeIds')?.value || [];
      const filteredStoreIds = currentStoreIds.filter(id => !duplicateStoreIds.includes(id));
      this.form.get('storeIds')?.setValue(filteredStoreIds);

      // Remove the current role from roleIds
      const currentRoles: string[] = this.form.get('roleId')?.value || [];
      this.form.get('roleId')?.setValue(currentRoles.filter(r => r !== roleId));

      const message = `<strong>${roleName}</strong> against the Store(s) <strong>${duplicateStoreNames}</strong> is already created.`;

      this.openDuplicateRoleModal(message, template);

      this.markForCheck();
    }
  });
}



  
  
  storeGroups = (companyId: any) => {
    this.storeSvc
      .getStoreGroups(companyId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((storeGroupsData: any) => {
        this.storeGroupsArray = storeGroupsData;
        this.auditorStoreGroupsArray = storeGroupsData;
        this.cd.markForCheck();
  
        // Optionally filter to only selected group IDs (if editing)
        const selectedGroupIds = this.form.get('storeGroupIds')?.value || [];
  
        selectedGroupIds.forEach((groupId: any) => {
          this.storeOnGroupsInitial(groupId, 'add');
        });

        if (
          this.auditorStoreGroupsArray &&
          this.auditorStoreGroupsArray.length > 0
        ) {
          this.auditorStoreGroupsArray.forEach((storeGroupId: any) => {
            storeGroupId
              ? this.auditorStoreOnGroupsInitial(storeGroupId.id, 'add')
              : '';
          });
        }
      });
  };
  
  storeOnGroupsInitial = (storeGroupId: any, state: string) => {
    this.storeSvc
      .getStores(storeGroupId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((storeData: any) => {
        if (storeData && state === 'add') {
          // Merge unique stores
          const uniqueStores = storeData.filter(
            (store: any) => !this.stores.some((s) => s.id === store.id)
          );
          this.stores = [...this.stores, ...uniqueStores];
          this.cd.markForCheck();
  
          const existingIds = this.form.get('storeIds')?.value || [];
          const newIds = storeData.map((s: any) => s.id);
          const combined = [...existingIds, ...newIds];
          const deduped = [...new Set(combined)];
          this.form.get('storeIds')?.setValue(deduped);
        }
      });
  };
  
  
  auditorStoreOnGroupsInitial = (storeGroupId: any, state: 'add') => {
    this.storeSvc
      .getStores(storeGroupId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((storeData: any) => {
        if (!storeData || !Array.isArray(storeData)) return;
  
        const newStores = storeData.filter(
          (b: any) => !this.auditorStores.some((a: any) => a.id === b.id)
        );
        this.auditorStores = [...this.auditorStores, ...newStores];
  
        const updatedStoreIds = this.auditorStores.map((s: any) => s.id);
        this.form.get('auditorStoreIds')?.patchValue(updatedStoreIds);
  
        this.cd.markForCheck();
      });
  };
  

  fetchStoresByGroupIds(groupIds: string[]) {
    const observables: Observable<any[]>[] = groupIds.map(id =>
      this.storeSvc.getStores(id) as Observable<any[]>
    );
  
    forkJoin(observables).subscribe((responses: any[][]) => {
      const allStores = responses.flat();
  
      const uniqueStores = allStores.filter(
        (store, index, self) => index === self.findIndex(s => s.id === store.id)
      );
  
      this.stores = uniqueStores;
      this.form.get('storeIds')?.patchValue(uniqueStores.map(s => s.id));
      this.cd.markForCheck();
    });
  }

  fetchAuditorStoresByGroupIds(groupIds: string[]) {
    const observables: Observable<any[]>[] = groupIds.map(id =>
      this.storeSvc.getStores(id) as Observable<any[]>
    );
  
    forkJoin(observables).subscribe((responses: any[][]) => {
      const allStores = responses.flat();
  
      const uniqueStores = allStores.filter(
        (store, index, self) => index === self.findIndex(s => s.id === store.id)
      );
  
      this.auditorStores = uniqueStores;
      this.form.get('auditorStoreIds')?.patchValue(uniqueStores.map(s => s.id));
      this.cd.markForCheck();
    });
  }
  
  onStoreGroupChanged = (event: any) => {
    const selected = this.form.get('storeGroupIds')?.value;
    this.selectedGroupIds = Array.isArray(selected) ? selected : [];

    this.fetchStoresByGroupIds(this.selectedGroupIds);
  };

  onStoreGroupRemoved = (event: any) => {
    const groupId = typeof event?.value === 'object' ? event.value.id : event?.value;

    if (groupId) {
      this.selectedGroupIds = this.selectedGroupIds.filter(id => id !== groupId);

      // If no groups are selected, clear stores
      if (this.selectedGroupIds.length === 0) {
        this.stores = [];
        this.form.get('storeIds')?.setValue([]);
        this.cd.markForCheck();
      } else {
        this.fetchStoresByGroupIds(this.selectedGroupIds);
      }
    }
  };

  onAuditorStoreGroupChanged = (event: any) => {
    const selected = this.form.get('auditorStoreGroupIds')?.value;
    this.selectedGroupIds = Array.isArray(selected) ? selected : [];

    this.fetchAuditorStoresByGroupIds(this.selectedGroupIds);
  };
  

  onAuditorStoreGroupRemoved = (event: any) => {
    const groupId = typeof event?.value === 'object' ? event.value.id : event?.value;

    if (groupId) {
      this.selectedGroupIds = this.selectedGroupIds.filter(id => id !== groupId);

      // If no groups are selected, clear stores
      if (this.selectedGroupIds.length === 0) {
        this.auditorStores = [];
        this.form.get('auditorStoreIds')?.setValue([]);
        this.cd.markForCheck();
      } else {
        this.fetchAuditorStoresByGroupIds(this.selectedGroupIds);
      }
    }
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
            const { auditorStoreGroupIds, ...rest } = this.form.getRawValue();

            this.userSvc
              .updateAsync(rest)
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe(
                () => {
                  observer.next(null);

                  observer.complete();
                },
                (error) => {
                  const errorTitle = error?.error?.title;

                  if (errorTitle === 'EmailAlreadyExistsException') {
                    this.toasterService.showError('Email already exists.', 'Error');
                    this.form.get('email')?.setErrors({ emailExists: true });
                  } else if (errorTitle === 'PhoneAlreadyExistsException') {
                    this.toasterService.showError('Phone number already exists.', 'Error');
                    this.form.get('phone')?.setErrors({ phoneExists: true });
                  
                  } else {
                    observer.error(error);

                  }

                  this.markForCheck();
                  this.isCreateRequestInProgress = false;
                }


              );
          } else {
            const { auditorStoreGroupIds, ...rest } = this.form.getRawValue();

            this.userSvc
              .createAsync(rest)
              .pipe(takeUntil(this.ngUnSubscribe))
              .subscribe(
                () => {
                  observer.next(null);

                  observer.complete();
                },
                (error) => {
                    const errorTitle = error?.error?.title;

                    if (errorTitle === 'EmailAlreadyExistsException') {
                      this.toasterService.showError('Email already exists.', 'Error');
                      this.form.get('email')?.setErrors({ emailExists: true });
                    } else if (errorTitle === 'PhoneAlreadyExistsException') {
                      this.toasterService.showError('Phone number already exists.', 'Error');
                      this.form.get('phone')?.setErrors({ phoneExists: true });
                     

                    } else {
                      observer.error(error);
                    }

                    this.markForCheck();
                    this.isCreateRequestInProgress = false;
                  }


              );
          }
        })
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe(
            () => {
              if (this.isVender) {
                this.router.navigateByUrl('/vendors/list');
              } else {
                this.router.navigateByUrl('/users/list');
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

  // public onRoleChanged(): void {
  //   const roleId = this.form.get('roleId')?.value;
  //   const companyId: string = this.form.get('companyId')?.value;

  //   const lastSelectedRoleId = roleId[roleId.length - 1];
  
  //   // Roles that should not be repeated in the same company
  //   const restrictedRolesForCompany = [
  //     RoleConstant.companyAdminId,
  //     RoleConstant.accountsPayableManager1,
  //     RoleConstant.accountsPayableManager2,
  //     RoleConstant.auditor2
  //   ];
  
  //   if (
  //     lastSelectedRoleId &&
  //     companyId &&
  //     restrictedRolesForCompany.includes(lastSelectedRoleId as RoleConstant)
  //   ) {
  //     this.checkRoles(lastSelectedRoleId, companyId, this.modalTemplate);
  //   }
    
    
  //   if (this.user.userRoles.some((x) => x.roleId == RoleConstant.globalAdminId)) {
  //     const usersList = this.users ? this.users.filter((x) =>
  //       x.userRoles.some((x) => x.roleId == roleId)
  //     ) : undefined;
  
  //     this.selectedCompanies = this.companyPagedListModel.items;
  
  //     if (roleId === RoleConstant.companyAdminId) {
  //       this.selectedCompanies = this.companyPagedListModel.items.filter(
  //         (x) =>
  //           usersList.filter((y) =>
  //             y.userRoles.some((x) => x.company.id === x.id)
  //           ).length === 0
  //       );
  //     }
  
  //     if (roleId === RoleConstant.auditorId) {
  //       this.selectedCompanies = this.companyPagedListModel.items.filter(
  //         (x) =>
  //           usersList.filter((y) =>
  //             y.userRoles.some((x) => x.company.id === x.id)
  //           ).length < 2
  //       );
  //     }
  //   }
  
  //   if (this.isAudor1Selected) {

  //     if(!this.userToEdit){
  //       this.auditorStoreGroupsArray = this.storeGroupsArray || [];
  //       this.auditorStores = this.stores || [];
  //     }

  //     this.form.controls['auditorStoreIds'].enable();
  //     this.form.controls['auditorStoreGroupIds'].enable();
  //     this.form.controls['auditorStoreIds'].setValidators([Validators.required]);
  //     this.form.controls['auditorStoreGroupIds'].setValidators([Validators.required]);
  //   } else {
  //     this.form.controls['auditorStoreIds'].disable();
  //     this.form.controls['auditorStoreGroupIds'].disable();
  //     this.form.controls['auditorStoreIds'].clearValidators();
  //     this.form.controls['auditorStoreGroupIds'].clearValidators();
  //   }
  
  //   this.form.controls['auditorStoreIds'].setValue([]);
  //   this.form.controls['auditorStoreGroupIds'].setValue([]);
  //   this.form.controls['auditorStoreIds'].updateValueAndValidity();
  //   this.form.controls['auditorStoreGroupIds'].updateValueAndValidity();
  // }

  public onRoleChanged(): void {
  const roleId = this.form.get('roleId')?.value;
  const companyId: string = this.form.get('companyId')?.value;
  const storeIds: string[] = this.form.get('storeIds')?.value || [];

  const lastSelectedRoleId = roleId[roleId.length - 1];

  // === Company-Level Restricted Roles ===
  const restrictedCompanyRoles = [
    RoleConstant.companyAdminId,
    RoleConstant.accountsPayableManager1,
    RoleConstant.accountsPayableManager2,
    RoleConstant.auditor2
  ];

  // === Store-Level Restricted Roles ===
  const restrictedStoreLevelRoles = [
    RoleConstant.vpOperations,
    RoleConstant.srDirectorOperations,
    RoleConstant.directorOperations,
    RoleConstant.generalManager,
    RoleConstant.supervisor
  ];

  // === Company-Level Role Check ===
  if (
    lastSelectedRoleId &&
    companyId &&
    restrictedCompanyRoles.includes(lastSelectedRoleId as RoleConstant)
  ) {
    this.checkRoles(lastSelectedRoleId, companyId, this.modalTemplate);
  }

  // === Store-Level Role Check ===
  if (
    lastSelectedRoleId &&
    storeIds.length > 0 &&
    restrictedStoreLevelRoles.includes(lastSelectedRoleId as RoleConstant)
  ) {
    this.checkStoreRoles(lastSelectedRoleId, companyId, storeIds, this.modalTemplate);
  }

  // === Global Admin Company Filtering Logic ===
  if (this.user.userRoles.some((x) => x.roleId == RoleConstant.globalAdminId)) {
    const usersList = this.users ? this.users.filter((x) =>
      x.userRoles.some((x) => x.roleId == roleId)
    ) : undefined;

    this.selectedCompanies = this.companyPagedListModel.items;

    if (roleId === RoleConstant.companyAdminId) {
      this.selectedCompanies = this.companyPagedListModel.items.filter(
        (x) =>
          usersList.filter((y) =>
            y.userRoles.some((x) => x.company.id === x.id)
          ).length === 0
      );
    }

    if (roleId === RoleConstant.auditorId) {
      this.selectedCompanies = this.companyPagedListModel.items.filter(
        (x) =>
          usersList.filter((y) =>
            y.userRoles.some((x) => x.company.id === x.id)
          ).length < 2
      );
    }
  }

  // === Auditor Role Logic ===
  if (this.isAudor1Selected) {
    if (!this.userToEdit) {
      this.auditorStoreGroupsArray = this.storeGroupsArray || [];
      this.auditorStores = this.stores || [];
    }

    this.form.controls['auditorStoreIds'].enable();
    this.form.controls['auditorStoreGroupIds'].enable();
    this.form.controls['auditorStoreIds'].setValidators([Validators.required]);
    this.form.controls['auditorStoreGroupIds'].setValidators([Validators.required]);
  } else {
    this.form.controls['auditorStoreIds'].disable();
    this.form.controls['auditorStoreGroupIds'].disable();
    this.form.controls['auditorStoreIds'].clearValidators();
    this.form.controls['auditorStoreGroupIds'].clearValidators();
  }

  this.form.controls['auditorStoreIds'].setValue([]);
  this.form.controls['auditorStoreGroupIds'].setValue([]);
  this.form.controls['auditorStoreIds'].updateValueAndValidity();
  this.form.controls['auditorStoreGroupIds'].updateValueAndValidity();
}

        

  get isAudor1Selected() {
    const roleId: Array<string> = this.form.get('roleId').value;
    return roleId && roleId.includes(RoleConstant.auditor1);
  }

  public onCompanyChanged(changeType: any): void {

    const roleId: string = this.form.get('roleId').value;

    let storeIds: string[] = [];

    const companyId: string = this.form.get('companyId').value;

   
      this.patchstoreGroups(companyId, changeType);
      // this.form.get('storeIds').patchValue(storeIds);
      // this.form.get('auditorStoreGroupIds').patchValue(storeIds);
      // this.form.get('auditorStoreIds')?.patchValue([]);
    

    if (
      this.user.userRoles.some((x) => x.roleId !== RoleConstant.globalAdminId)
    ) {
      if (
        this.users &&
        this.users.length > 0 &&
        this.users.filter((x) =>
          x.userRoles.some(
            (x) =>
              x.company.id === companyId && x.roleId === RoleConstant.auditorId
          )
        ).length > 0
      ) {
        this.roles = this.roles.filter((x) => x.id !== RoleConstant.auditorId);
      }

      if (
        this.users &&
        this.users.length > 0 &&
        this.users.filter((x) =>
          x.userRoles.some(
            (x) =>
              x.company.id === companyId &&
              x.roleId === RoleConstant.companyAdminId
          )
        ).length > 0
      ) {
        this.roles = this.roles.filter(
          (x) => x.id !== RoleConstant.companyAdminId
        );
      }
    }

    this.markForCheck();
  }

  patchstoreGroups = (companyId: any, userType: any) => {
  
    this.storeSvc
      .getStoreGroups(companyId)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((storeGroupsData: any) => {

        const groupData = storeGroupsData;

        if (userType === 'normal') {
          this.form.get('storeGroupIds')?.patchValue([]);
          this.form.get('storeIds')?.patchValue([]);
          this.storeGroupsArray = groupData;
        } else {
          this.form.get('auditorStoreGroupIds')?.patchValue([]);
          this.form.get('auditorStoreIds')?.patchValue([]);
          this.auditorStoreGroupsArray = groupData;
        }
        
        
        
      });
      this.cd.markForCheck();
  };

 

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
        roleId: [{ value: [], disabled: true }, [Validators.required]],
        companyId: [null, Validators.required],
        storeIds: [[],Validators.required],
        profilePictureWebUrl: [null],
        storeGroupIds: [[],Validators.required],
        auditorStoreIds: [[]],
        auditorStoreGroupIds: [
          []
        ],
      },
      {
        validator: ConfirmPasswordValidator('password', 'confirmPassword'),
      }
    );
  }

  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 30) {
      input.value = input.value.slice(0, 30);
      this.form.get('password')?.setValue(input.value);
    }
  }

  private searchVendor() {
    this.venderSvc
      .searchAsync(<VendorSearchRequestModel>{ ids: [this.id] })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(
        (x) => {
          this.isInitInProgress = false;

          if (x.totalRecords > 0) {
            this.userToEdit = x.items[0];
            const user = {
              id: this.userToEdit.id,
              profilePictureWebUrl: this.userToEdit.profilePictureWebUrl,
              firstName: this.userToEdit.firstName,
              lastName: this.userToEdit.lastName,
              email: this.userToEdit.email,
              password: this.userToEdit.password,
              confirmPassword: this.userToEdit.password,
              phone: this.userToEdit.phone,
              roleId: this.userToEdit.userRoles[0].roleId,
              companyId: null as any,
              storeIds: [] as any,
              storeGroupIds: [] as any,
              
            };
            this.form.patchValue(user);
            this.markForCheck();
          }
        },
        (error) => {}
      );
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
                          companyId:
                            this.userToEdit.userRoles[0].company &&
                            this.userToEdit.userRoles[0].company.id
                              ? this.userToEdit.userRoles[0].company.id
                              : undefined,
                          storeIds:
                            this.userToEdit.userRoles[0].store &&
                            this.userToEdit.userRoles[0].group
                              ? this.userToEdit.userRoles
                                  .filter((x) => x.store != null && x.roleId != RoleConstant.auditor1)
                                  .map((x) => x.store.id)
                              : undefined,
                          storeGroupIds:
                            this.userToEdit.userRoles[0].store &&
                            this.userToEdit.userRoles[0].group
                              ? this.userToEdit.userRoles
                                  .filter((x) => x.store != null && x.roleId != RoleConstant.auditor1)
                                  .map((x) => x.group.id)
                              : undefined,
                          auditorStoreIds:
                            this.userToEdit.userRoles[0].store &&
                            this.userToEdit.userRoles[0].group
                              ? this.userToEdit.userRoles
                                  .filter((x) => x.store != null && x.roleId == RoleConstant.auditor1)
                                  .map((x) => x.store.id)
                              : undefined,
                          auditorStoreGroupIds:
                            this.userToEdit.userRoles[0].store &&
                            this.userToEdit.userRoles[0].group
                              ? this.userToEdit.userRoles
                                  .filter((x) => x.store != null && x.roleId == RoleConstant.auditor1)
                                  .map((x) => x.group.id)
                              : undefined,
                        };

                        this.form.patchValue(user);

                        if (
                          user.roleId.filter(
                            (x) => x != RoleConstant.globalAdminId
                          ) &&
                          user.roleId.filter(
                            (x) => x != RoleConstant.companyAdminId
                          )
                        ) {
                          user.companyId
                            ? this.storeGroups(user.companyId)
                            : undefined;
                        }
                      } else {
                        this.form
                          .get('password')
                          .setValidators([
                            Validators.required,
                            Validators.minLength(6),
                          ]);

                        this.form.get('roleId').setValue(this.roles[0].id);

                        this.onRoleChanged();
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

  openDuplicateRoleModal(message: string, template: TemplateRef<any>) {
    this.duplicateRoleMsg = message;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered user-create-modal',
      ignoreBackdropClick: true,
      keyboard: false,
    });
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

sanitizePhoneInput(event: ClipboardEvent): void {
  event.preventDefault();

  const clipboardData = event.clipboardData?.getData('text') || '';
  const sanitized = clipboardData.replace(/[^\d]/g, '');

  const target = event.target as HTMLInputElement;
  const start = target.selectionStart || 0;
  const end = target.selectionEnd || 0;
  const originalValue = target.value;

  const newValueUntrimmed = originalValue.substring(0, start) + sanitized + originalValue.substring(end);
  const newValue = newValueUntrimmed.slice(0, 15);

  target.value = newValue;

  const formControl = this.form.get('phone');
  if (formControl) {
    formControl.patchValue(newValue);
    formControl.markAsDirty();
    formControl.markAsTouched();
    formControl.updateValueAndValidity();
  }
}



  ngOnDestroy() {
    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();
  }
  
}
