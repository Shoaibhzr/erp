import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';

@Pipe({
  name: 'userStoreToCompany'
})
export class UserStoreToCompanyPipe implements PipeTransform {

  transform(userRoles: UserRoleModel[]): string {
    if (!userRoles || userRoles.length === 0) {
      return '';
    }

    var allItems=[...new Set(userRoles.filter(x => x.store != null).map(x => x.store.name))];

    var initialItems= allItems.slice(0,2).join(', ');

    var remainingItems =  allItems.length > 2 ? allItems.length - 2 : 0;
    
    return remainingItems > 0 ? initialItems + ' and + ' + remainingItems  : initialItems;
  
    
  }

}
