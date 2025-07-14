import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestPriority } from '../../models/service-request-priority';

@Pipe({
  name: 'priority'
})
export class PriorityPipe implements PipeTransform {

  transform(priority: ServiceRequestPriority): string {

    let priorityToStr: string = priority;

    switch (priority) {

      case (ServiceRequestPriority.critical): {
        priorityToStr = "Critical";
        break;
      }

      case (ServiceRequestPriority.nonCritical): {
        priorityToStr = "Non-critical";
        break;
      }

      case (ServiceRequestPriority.emergency): {
        priorityToStr = "Emergency";
        break;
      }

      default: {
        break;
      }

    }

    return `${priorityToStr}`;

  }

}
