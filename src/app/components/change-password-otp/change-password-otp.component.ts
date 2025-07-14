import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordChangeOTPRequestModel } from 'src/app/models/request/password-change-otp.model';
import { Helpers } from 'src/app/utils/helpers-util';

const timeInterval = 300;

@Component({
  selector: 'app-change-password-otp',
  templateUrl: './change-password-otp.component.html',
  styleUrls: ['./change-password-otp.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})

export class ChangePasswordOtpComponent implements OnInit {

  public isInitInProgress: boolean;
  public newPasswordVisible: boolean;
  public confirmNewPasswordVisible: boolean;
  public form: FormGroup;
  public timer: number = timeInterval; // Timer in seconds
  public isResendDisabled: boolean = true;
  public interval: any;
  @Output() onSubmit: EventEmitter<PasswordChangeOTPRequestModel> = new EventEmitter<PasswordChangeOTPRequestModel>();
  @Output() onResend: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm()
    this.startTimer()
  }

  changePassword() {
    const passwordChangeOTPPayload: PasswordChangeOTPRequestModel = { otp: this.form.get('otp').value, newPassword: this.form.get('newPassword').value }
    this.onSubmit.emit(passwordChangeOTPPayload)
  }

  getMinsFromSeconds(timeInSecs: number) {
    return Helpers.convertSecondsToMinutes(timeInSecs)
  }

  resendOTP() {
    this.onResend.emit(true)
  }

  private initForm() {
    this.form = this.fb.group({
      otp: [null, [Validators.required]],
      newPassword: [null, [Validators.required]],
      confirmNewPassword: [null, [Validators.required]],
    });
  }


  private startTimer() {
    this.isResendDisabled = true;
    this.timer = timeInterval;
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.isResendDisabled = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }

}
