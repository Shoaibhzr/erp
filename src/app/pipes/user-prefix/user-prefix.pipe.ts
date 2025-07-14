import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestPriority } from '../../models/service-request-priority';
import { UserMinimalModel } from '../../models/user-minimal-model';

@Pipe({
  name: 'userPrefix'
})
export class UserPrefixPipe implements PipeTransform {

  transform(user: UserMinimalModel): string {
    const firstInitial = user.firstName && user.firstName[0] ? user.firstName[0].toUpperCase() : '';
    const lastInitial = user.lastName && user.lastName[0] ? user.lastName[0].toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;

  }

}
