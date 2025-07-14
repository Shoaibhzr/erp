import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';
import { StoreModel } from '../../models/store-model';
import { StoreMinimalModel } from '../../models/store-minimal-model';

@Pipe({
  name: 'userStoreNameToStore'
})
export class UserStoreNameToStorePipe implements PipeTransform {

  transform(stores: any[]): string {
    if (stores == null || stores.length === 0) {
      return '';
    }

    return [...new Set(stores.filter((x:any) => x.name != null).map((x:any) => x.name))].join(', ');
    
  }

}
