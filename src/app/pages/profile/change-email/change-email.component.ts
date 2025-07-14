import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { ExceptionName } from 'src/app/models/common';
import { SessionStorageConstants } from 'src/app/models/common/session-storage-constants';
import { UserModel } from 'src/app/models/user-model';
import { SessionStorageService } from 'src/app/services/sessions-storage.service';
import { UserService } from 'src/app/services/user.service';
import { ExceptionHandler } from 'src/app/utils/exceptions-handler';
import { ToasterService } from 'src/app/utils/toaster.service';
import { UserRolesToRolePipe } from 'src/app/pipes/user-roles-to-role/user-roles-to-role.pipe';
import { Helpers } from 'src/app/utils/helpers-util';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent {
  @ViewChild('template') modalTemplate!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('updateFileInput') updateFileInput: ElementRef<HTMLInputElement>;

  public isInitInProgress: boolean;
  public form!: FormGroup;
  public showOtpPopup: boolean;
  public loggedInUser: UserModel;

  public otp: string = '';
  public otpErrorMessage: string = '';
  public isResendDisabled: boolean = true;
  public timer: number = 0;
  public interval: any;

  public companyID: string;

  public file: File;
  public fileDataUrl: string;

  public originalEmail: string;
  public currentEmail: string;
  public isEmailVerified: boolean = false;
  public modalRef?: BsModalRef;

  private ngUnSubscribe: Subject<void> = new Subject<void>();


  constructor(
    private cd: ChangeDetectorRef,
    public userRolesToRolePipe: UserRolesToRolePipe,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToasterService,
    private sessionStorageService: SessionStorageService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.sessionStorageService.getItem(SessionStorageConstants.USER)
    this.companyID = this.loggedInUser?.userRoles[0]?.company?.id;
    this.initForm(this.loggedInUser);

    this.startTimer()
  }

  private initForm(user: UserModel) {
  this.originalEmail = user.email;
  this.isEmailVerified = false;

  this.form = this.fb.group({
    id:[user.id],
    firstName: [user.firstName, [Validators.required, Validators.maxLength(50)]],
    lastName: [user.lastName, [Validators.required, Validators.maxLength(50)]],
    companyId: [this.companyID],
    role: [{ value: this.userRolesToRolePipe.transform(user?.userRoles) ?? null, disabled: true }],
    phone: [user.phone, [Validators.required, Validators.maxLength(15)]],
    email: [user.email, [Validators.required]],
    profilePictureWebUrl: [user.profilePictureWebUrl],
  });
}

isInvalid(controlName: string): boolean {
  const control = this.form.get(controlName);
  return !!(control && control.invalid && control.touched);
}

  private markForCheck(): void {
    this.cd.markForCheck();
  }

  sendOtpForEmailChange() {
  this.isInitInProgress = true;

  const email = this.form.get('email')?.value;

  this.userService.getChangeEmailOTP(email).subscribe({
    next: () => {
      this.isInitInProgress = false;
      this.openPopup(); 
    },
    error: () => {
      this.isInitInProgress = false;
      this.toastr.showError('Error sending OTP');
    },
  });
}

getMinsFromSeconds(timeInSecs: number) {
    return Helpers.convertSecondsToMinutes(timeInSecs)
  }


  verifyOtp(otp: string) {
  this.isInitInProgress = true;

  this.userService.VerifyChangeEmailOTP(otp).subscribe({
    next: () => {
      this.isInitInProgress = false;
      this.isEmailVerified = true;
      this.closePopup();

      // Now proceed to update user after successful OTP
      this.performUserUpdate();

      // update reference email for future checks
      this.originalEmail = this.form.get('email')?.value;
    },
    error: () => {
      this.isInitInProgress = false;
      this.toastr.showError('Invalid OTP');
    },
  });
}

public performUserUpdate(): void {
  if (!this.form.valid) {
    this.markForCheck();
    return;
  }

  this.isInitInProgress = true;
  this.markForCheck();

  new Observable<void>((observer) => {
    if (this.file) {
      const fd = new FormData();
      fd.append('File', this.file);

      this.userService
        .uploadProfilePictureAsync(fd)
        .pipe(takeUntil(this.ngUnSubscribe))
        .subscribe(
          (x) => {
            this.form.get('profilePictureWebUrl')?.patchValue(x.uri);
            observer.next();
            observer.complete();
          },
          (error) => {
            this.toastr.showError('Failed to upload profile picture.');
            this.isInitInProgress = false;
            this.markForCheck();
            observer.error(error);
          }
        );
    } else {
      observer.next();
      observer.complete();
    }
  })
    .pipe(takeUntil(this.ngUnSubscribe))
    .subscribe(() => {
      new Observable<void>((observer) => {
        const userID = this.form.get('id')?.value;
        if (userID) {
          this.userService
            .updateAsync(this.form.value)
            .pipe(takeUntil(this.ngUnSubscribe))
            .subscribe(
              () => {
                observer.next();
                observer.complete();
              },
              (error) => {
                this.toastr.showError('Error Profile Update');
                this.isInitInProgress = false;
                this.markForCheck();
                observer.error(error);
              }
            );
        }
      }).pipe(takeUntil(this.ngUnSubscribe))
        .subscribe({
          next: () => {
            this.toastr.showSuccess('Profile updated successfully.');
            this.isInitInProgress = false;
            this.markForCheck();
          },
        });
    });
}



  openPopup() {
    this.showOtpPopup = true;
    this.startTimer();
  }

  closePopup() {
    this.showOtpPopup = false;
  }

  private startTimer() {
  this.isResendDisabled = true;
  this.timer = 180;
  this.interval = setInterval(() => {
    if (this.timer > 0) {
      this.timer--;
    } else {
      this.isResendDisabled = false;
      clearInterval(this.interval);
    }
  }, 1000);
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
    delete this.loggedInUser.profilePictureWebUrl;
  
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

  updateUserDetail() {
   this.currentEmail = this.form.get('email')?.value;

  if (this.currentEmail !== this.originalEmail && !this.isEmailVerified) {
    // Email changed but OTP not verified yet
    this.sendOtpForEmailChange();
  } else {
    // Either email not changed or already verified
    this.openConfirmationModal(this.modalTemplate);
  }
}

openConfirmationModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-dialog-centered user-create-modal',
        ignoreBackdropClick: true,
        keyboard: false,
      });
    }

confirmUserUpdate() {
  this.performUserUpdate();
  this.modalRef?.hide();
}


}
