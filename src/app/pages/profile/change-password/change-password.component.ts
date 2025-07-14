import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExceptionName } from 'src/app/models/common';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user-model';
import { SessionStorageService } from 'src/app/services/sessions-storage.service';
import { SessionStorageConstants } from 'src/app/models/common/session-storage-constants';
import { ConfirmPasswordValidator } from 'src/app/validators/confirm-password.validator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})

export class ChangePasswordComponent implements OnInit {

  public currentPasswordVisible: boolean = false;
  public newPasswordVisible: boolean = false;
  public confirmNewPasswordVisible: boolean = false;

  public isInitInProgress: boolean = false;
  public form!: FormGroup;
  public selectedUserModel: UserModel;

  public modalRef?: BsModalRef;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.initForm()
     this.selectedUserModel = this.sessionStorageService.getItem(SessionStorageConstants.USER)
  }


  private initForm() {
    this.form = this.fb.group({
      currentPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      confirmNewPassword: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
    },
      {
        validator: ConfirmPasswordValidator('newPassword', 'confirmNewPassword'),
      });
  }

  isInvalid(controlName: string): boolean {
  const control = this.form.get(controlName);
  return !!(control && control.invalid && (control.dirty || control.touched));
}

  public changePassword(): void {
    this.isInitInProgress = true;
    const payload = {
      "currentPassword": this.form.get('currentPassword').value,
      "newPassword": this.form.get('newPassword').value,
      "updatePasswordType": "Change",
    }
    this.userService.changePasswordAsync(payload).subscribe({
      next: (response) => {
        this.toastr.success('Password updated successfully!');
        this.router.navigateByUrl("/");
      },
      error: (error) => {
        this.isInitInProgress = false;
        if(error.error.title === ExceptionName.currentPasswordMismatch) {
          this.toastr.error('The current password you entered is incorrect. Please try again.');
        }
      }
    })
  }

  openConfirmationModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-dialog-centered user-create-modal',
        ignoreBackdropClick: true,
        keyboard: false,
      });
    }

    confirmChangePassword() {
      this.changePassword();
      this.modalRef?.hide();
    }

}
