
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, forkJoin, takeUntil, tap, timeInterval } from 'rxjs';

/** Services */
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';
import { AuthenticateRequestModel } from '../../models/request/authenticate-request-model';
import { StorageKey } from '../../models/common';
import { ContextService } from '../../services/context.service';
import { ToasterService } from 'src/app/utils/toaster.service';
import { ExceptionHandler } from 'src/app/utils/exceptions-handler';
import { PasswordChangeOTPRequestModel } from 'src/app/models/request/password-change-otp.model';
import { Helpers } from 'src/app/utils/helpers-util';
import { ConfirmPasswordValidator } from 'src/app/validators/confirm-password.validator';
@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent {


    public form!: FormGroup;
    passwordForm: FormGroup;
  
    public islogin: boolean = true;
    public isOTP: boolean = false;
    public isNewPassword: boolean = false;
  
    public timer: number = 0;
    public isResendDisabled: boolean = true;
    public interval: any;
  
    public email: string;
  
    public otp: string = '200200';
    public otpErrorMessage: string = '';
  
    public showOtpPopup: boolean;
  
    public isLoginInProgress: boolean;
  
    public loginError: boolean;
  
    public passwordVisible: boolean;
    public confirmPasswordVisible: boolean;
  
    private ngUnSubscribe: Subject<void> = new Subject<void>();
  
    constructor(private cd: ChangeDetectorRef, private router: Router,
      private fb: FormBuilder, private userSvc: UserService,
      private storageSvc: StorageService, private contextSvc: ContextService,
      private toastr: ToasterService) { }
  
    ngOnInit() {
  
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        rememberMe: [undefined]
      });
      
      this.passwordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]]
          }, {
                  validator: ConfirmPasswordValidator('password', 'confirmPassword'),
                });
    
      this.form.get('email').valueChanges.subscribe(value => {
        if (value) {
          const trimmedValue = value.replace(/\s+/g, '');
          if (trimmedValue !== value) {
            this.form.get('email').setValue(trimmedValue, { emitEvent: false });
          }
        }
      });
  
      this.markForCheck();
  
    }
  
    public login(): void {
  
      this.loginError = false;
  
      if (!this.form.valid) {
  
        this.markForCheck();
  
        return;
  
      }
  
      this.isLoginInProgress = true;
  
      this.markForCheck();
  
      const authenticateRequestModel: AuthenticateRequestModel = this.form.getRawValue();
  
      this.userSvc.authenticateAsync(authenticateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(
        x => {
  
          forkJoin([
            this.storageSvc.set(StorageKey.jwt, x.jwt.token, true),
            this.storageSvc.set(StorageKey.refreshToken, x.jwt.refreshToken, true)
          ]).pipe(takeUntil(this.ngUnSubscribe)).subscribe(y => {
  
            this.contextSvc.user.next(x.user);
  
            this.router.navigateByUrl("/");
  
            this.markForCheck();
  
          });
  
        },
        () => {
  
          this.isLoginInProgress = false;
  
          this.loginError = true;
  
          this.markForCheck();
  
        }
      );
  
    }
  
    private markForCheck(): void {
  
      this.cd.markForCheck();
  
    }
  
    ngOnDestroy() {
  
      this.ngUnSubscribe.next();
  
      this.ngUnSubscribe.complete();
  
    }
  
    sendOtp() {
    this.isLoginInProgress = true;
  
    // Simulate API call
    setTimeout(() => {
      this.isLoginInProgress = false;
      this.islogin = false;
      this.isOTP = true;
      this.startTimer();
    }, 1000);
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
  
  getMinsFromSeconds(timeInSecs: number) {
      return Helpers.convertSecondsToMinutes(timeInSecs)
    }
  
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    }
  
    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  
    getChangePasswordOTP() {
      // this.showOtpPopup = false;
      this.setLoaderVisibility(true)
      this.userSvc.getChangePasswordOTP(this.email).subscribe({
        next: () => {
          this.setLoaderVisibility(false);
          this.sendOtp();
        },
        error: (error) => {
          this.setLoaderVisibility(false)
          this.toastr.showError(ExceptionHandler.getExceptionMessage(error) ?? 'Error sending OTP')
        }
      })
    }
  
    // verifyOtp(passwordChangeOTPPayload: PasswordChangeOTPRequestModel) {
    //   this.setLoaderVisibility(true)
    //   this.userSvc.VerifyChangePasswordOTP(passwordChangeOTPPayload).subscribe({
    //     next: () => {
    //       this.setLoaderVisibility(false)
    //       this.isNewPassword = true;
    //     },
    //     error: (error) => {
    //       this.setLoaderVisibility(false)
    //       this.toastr.showError(ExceptionHandler.getExceptionMessage(error) ?? 'Error verifying OTP')
    //     }
    //   })
    // }
  
    verifyOtp(otp: string) {
  
      if(otp === '200200') {
        this.otpErrorMessage = '';
        this.isOTP = false;
        this.isNewPassword = true
      } else {
        this.otpErrorMessage = 'The OTP you entered is incorrect.';
      }
    // this.setLoaderVisibility(true);
  
    // const payload: PasswordChangeOTPRequestModel = {
    //   otp: otp
    // };
  
    // this.userSvc.VerifyChangePasswordOTP(payload).subscribe({
    //   next: () => {
    //     this.setLoaderVisibility(false);
    //     this.isNewPassword = true;
    //     this.otpErrorMessage = ''; 
    //   },
    //   error: (error) => {
    //     this.setLoaderVisibility(false);
  
    //     const message =
    //       error?.error?.message?.toLowerCase() || '';
  
    //     if (message.includes('expired')) {
    //       this.otpErrorMessage = 'OTP has expired. Please request a new one.';
    //     } else if (message.includes('invalid') || message.includes('incorrect')) {
    //       this.otpErrorMessage = 'The OTP you entered is incorrect.';
    //     } else {
    //       this.otpErrorMessage = 'Something went wrong. Please try again.';
    //     }
    //   }
    // });
  }
  
  
    setLoaderVisibility(visibility: boolean) {
      this.isLoginInProgress = visibility;
      this.markForCheck()
    }
}
