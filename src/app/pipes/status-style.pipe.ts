import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestStatus } from '../models/service-request-status';

@Pipe({
  name: 'statusStyle',
  pure: true,
  standalone: true,
})
export class StatusStylePipe implements PipeTransform {
  transform(status: ServiceRequestStatus): { [key: string]: string } {
    switch (status) {
      case ServiceRequestStatus.pendingApproval:
        return {
          backgroundColor: '#FEF4E4',
          color: '#F7B84B',
        };
      case ServiceRequestStatus.approved:
        return {
          backgroundColor: '#DAF4F0',
          color: '#0AB39C',
        };
      case ServiceRequestStatus.rejected:
        return {
          backgroundColor: '#FDE8E4',
          color: '#F06548',
        };
      default:
        return {
          backgroundColor: '#f3f6f9',
          color: 'black',
        };
    }
  }
}
