import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, of, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Location } from '@angular/common';

/** Models */
import { StorageKey } from '../../models/common';
import { StoreModel } from '../../models/store-model';
import { CompanyModel } from '../../models/company-model';
import { StoreCreateRequestModel } from '../../models/request/store-create-request-model';
import { StoreUpdateRequestModel } from '../../models/request/store-update-request-model';
import { StoreSearchRequestModel } from '../../models/request/store-search-request-model';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';

/** Services */
import { StoreService } from '../../services/store.service';
import { CompanyService } from '../../services/company.service';
import { UserModel } from '../../models/user-model';
import { UserService } from '../../services/user.service';
import { UserSearchRequestModel } from '../../models/request/user-search-request-model';
import { RoleConstant } from '../../models/role-constant';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EmailValidator } from 'src/app/validators/email.validator';

@Component({
  selector: 'store-create',
  templateUrl: './store-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StoreCreatePage implements OnInit, OnDestroy {

  public id: string;

  public companies: CompanyModel[];

  public form!: FormGroup;

  public modalRef?: BsModalRef;

  public isInitInProgress: boolean;

  public isCreateRequestInProgress: boolean;

  public storeModel: StoreModel;

  public srDirectorOperations: UserModel[];

  public directorOperations: UserModel[];

  public supervisor: UserModel[];

  public generalManager: UserModel[];

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private companySvc: CompanyService,
    private storeSvc: StoreService,
    private userSvc: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: BsModalService) {

  }

  ngOnInit() {

    this.isInitInProgress = true;

    this.markForCheck();

    this.companySvc
      .searchAsync(<CompanySearchRequestModel>{ page: 1, pageSize: 50 })
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(companies => {
        this.companies = companies.items;

         this.id = this.route.snapshot.params["id"];
        let storeFetch$ = this.id
          ? this.storeSvc.searchAsync(<StoreSearchRequestModel>{ ids: [this.id] })
          : of({ totalRecords: 0, items: [] });

        storeFetch$
          .pipe(takeUntil(this.ngUnSubscribe))
          .subscribe(
            storeRes => {
              if (storeRes.totalRecords > 0) {
                this.storeModel = storeRes.items[0];
              }

              this.form = this.fb.group({
                id: [null],
                companyId: [null],
                name: [null, [Validators.required, Validators.maxLength(50)]],
                phone: [null, [Validators.required, Validators.maxLength(15)]],
                address: [null, [Validators.maxLength(50)]],
                contactName: [null, [Validators.required, Validators.maxLength(30)]],
                contactEmail: [null, [Validators.required, Validators.maxLength(50), 
                  EmailValidator.pattern(
                                            /^[a-z0-9_]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/gi
                                          ),
                ]],
                // srDirectorOperationsIds: [],
                // directorOperationsIds: [],
                // supervisorIds: [],
                // generalManagerIds: []
              });

              if (this.storeModel) {
                this.form.patchValue(this.storeModel);
                this.form.get('companyId').setValue(this.storeModel.company.id);

              } else {
                this.form.get('companyId').setValue(this.companies[0].id);
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


  }

  public create(): void {

    if (!this.form.valid) {

      this.markForCheck();

      return;

    }

    this.isCreateRequestInProgress = true;

    this.markForCheck();

    new Observable<void>(observer => {

      observer.next(null);

      observer.complete();

    }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      new Observable<void>(observer => {

        if (this.id) {

          const updateRequestModel = this.form.getRawValue();

          this.storeSvc.updateAsync(updateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

            () => {

              observer.next(null);

              observer.complete();

            },
            (error) => {

              observer.error(error);

            }

          );

        }
        else {

          const createRequestModel = this.form.getRawValue();

          this.storeSvc.createAsync(createRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

            () => {

              observer.next(null);

              observer.complete();

            },
            (error) => {

              observer.error(error);

            }

          );

        }

      }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

        () => {

          this.router.navigateByUrl("/stores/list");

          this.markForCheck();

        },
        () => {

          this.isCreateRequestInProgress = false;

          this.markForCheck();

        }

      );

    });

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
  const sanitized = clipboardData.replace(/[^\d+]/g, '');

  const target = event.target as HTMLInputElement;
  const start = target.selectionStart || 0;
  const end = target.selectionEnd || 0;
  const originalValue = target.value;

  const newValue =
    originalValue.substring(0, start) + sanitized + originalValue.substring(end);
  target.value = newValue;

  const formControl = this.form.get('phone');
  if (formControl) {
    formControl.setValue(newValue);
  }
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

  private markForCheck(): void {

    this.cd.markForCheck();

  }

   public goBack() {
    this.location.back();
  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
