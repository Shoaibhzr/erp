import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, Output, EventEmitter, OnInit } from '@angular/core';
import { Helpers } from 'src/app/utils/helpers-util';

const timeInterval = 300 //5 mins expiry

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
  imports: [CommonModule],
  standalone: true
})

export class OtpComponent implements OnInit {
  
  @ViewChildren('otp1, otp2, otp3, otp4') otpInputs!: QueryList<ElementRef>;
  otpValue: string = '';
  timer: number = timeInterval; // Timer in seconds
  isResendDisabled: boolean = true;
  interval: any;
  @Output() onSubmit: EventEmitter<string> = new EventEmitter<string>();
  @Output() onResend: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.startTimer()
  }

  moveToNext(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 6) {
      const nextInput = this.otpInputs.get(index);
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }
    this.otpValue = this.otpInputs.map(input => input.nativeElement.value).join('');
  }
  
  moveToPrev(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 1) {
      const prevInput = this.otpInputs.get(index - 2);
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
    this.otpValue = this.otpInputs.map(input => input.nativeElement.value).join('');
  }

  startTimer() {
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

  resendOTP() {
    this.startTimer()
    this.onResend.emit(true)
  }

  submitOTP() {
    this.otpValue = this.otpInputs.map(input => input.nativeElement.value).join('');
    this.onSubmit.emit(this.otpValue)
  }

  getMinsFromSeconds(timeInSecs: number) {
    return Helpers.convertSecondsToMinutes(timeInSecs)
  }
}
