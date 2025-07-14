import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss'],
  imports: [PaginationModule, CommonModule, FormsModule],
  standalone: true,
})
export class CustomPaginationComponent {
  @Input() totalItems: number;
  @Input() currentPage: number;
  @Input() isLoading: boolean;
  @Input() maxSize = 5;
  @Input() disabled = false;
  @Input() itemsPerPage = 10;
  @Output() pageChanged = new EventEmitter<number>();

  onPageChanged(event: PageChangedEvent): void {
    this.pageChanged.emit(event.page);
  }
}
