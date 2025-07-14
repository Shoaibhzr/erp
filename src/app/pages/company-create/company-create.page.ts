import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

/** Models */
import { StorageKey } from '../../models/common';
import { CompanyCreateRequestModel } from '../../models/request/company-create-request-model';

/** Services */
import { CompanyService } from '../../services/company.service';
import { CompanySearchRequestModel } from '../../models/request/company-search-request-model';
import { CompanyModel } from '../../models/company-model';
import { EmailValidator } from 'src/app/validators/email.validator';

@Component({
  selector: 'company-create',
  templateUrl: './company-create.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CompanyCreatePage implements OnInit, OnDestroy {

   @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('updateFileInput') updateFileInput: ElementRef<HTMLInputElement>;

  public id: string;

  public form!: FormGroup;

  public isInitInProgress: boolean;

  public isCreateRequestInProgress: boolean;

  public file: File;

  public fileDataUrl: string;

  public companyModel: CompanyModel;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private companySvc: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location) {

  }

  ngOnInit() {

    this.isInitInProgress = true;

    this.markForCheck();

    new Observable<void>(observer => {

      this.id = this.route.snapshot.params["id"];

      if (this.id) {

        this.companySvc.searchAsync(<CompanySearchRequestModel>{ ids: [this.id] }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

          (x) => {

            if (x.totalRecords > 0) {

              this.companyModel = x.items[0];

            }

            observer.next(null);

            observer.complete();

          },
          (error) => {

            observer.error(error);

          }
        );

      }
      else {

        observer.next(null);

        observer.complete();

      }

    }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

      () => {

        this.form = this.fb.group({
          id: [null],
          name: [null, [Validators.required, Validators.maxLength(50)]],
          address: [null, [Validators.required, Validators.maxLength(50)]],
          website: [null, [Validators.maxLength(50)]],
          detail: [null, [Validators.maxLength(1024)]],
          logoUrl: [null],
          contactName: [null, [Validators.required, Validators.maxLength(50)]],
          contactEmail: [null, [Validators.required, Validators.email, Validators.maxLength(50), 
            EmailValidator.pattern(
                          /^[a-z0-9_]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/gi
                        ),
          ]]
        });

        if (this.companyModel) {

          this.form.patchValue(this.companyModel);

        }

        this.isInitInProgress = false;

        this.markForCheck();

      },
      () => {

        this.isInitInProgress = false;

        this.markForCheck();

      }

    );

  }

   get detail(): string {
  return this.form.get('detail')?.value || '';
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

  public create(): void {

    if (!this.form.valid) {

      this.markForCheck();

      return;

    }

    this.isCreateRequestInProgress = true;

    this.markForCheck();

    new Observable<void>(observer => {

      if (this.file) {

        const fd = new FormData();

        fd.append("File", this.file);

        this.companySvc.uploadLogoAsync(fd).pipe(takeUntil(this.ngUnSubscribe)).subscribe(x => {

          this.form.get('logoUrl').patchValue(x.uri);

          observer.next(null);

          observer.complete();

        });

      }
      else {

        observer.next(null);

        observer.complete();

      }

    }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      new Observable<void>(observer => {

        if (this.id) {

          const updateRequestModel = this.form.getRawValue();

          this.companySvc.updateAsync(updateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

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

          this.companySvc.createAsync(createRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(

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

          this.router.navigateByUrl("/companies/list");

          this.markForCheck();

        },
        () => {

          this.isCreateRequestInProgress = false;

          this.markForCheck();

        }

      );

    });

  }

  public deleteLogo(): void {

    delete this.file;

    delete this.fileDataUrl;

    delete this.companyModel.logoUrl;

    this.form.get('logoUrl').setValue(undefined);

    this.markForCheck();

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
