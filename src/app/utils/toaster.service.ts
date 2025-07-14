import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ToasterService {

  constructor(private toastr: ToastrService) {}

  /**
   * Show success message
   */
  showSuccess(message: string, title: string | null = null): void {
    this.toastr.success(message, title);
  }

  /**
   * Show error message
   */
  showError(message: string, title: string | null = null): void {
    this.toastr.error(message, title);
  }

  /**
   * Show info message
   */
  showInfo(message: string, title: string | null = null): void {
    this.toastr.info(message, title);
  }

  /**
   * Show warning message
   */
  showWarning(message: string, title: string | null = null): void {
    this.toastr.warning(message, title);
  }
}
