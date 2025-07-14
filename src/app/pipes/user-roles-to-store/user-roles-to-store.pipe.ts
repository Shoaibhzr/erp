import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';
import { StoreModel } from '../../models/store-model';
import { StoreMinimalModel } from '../../models/store-minimal-model';

@Pipe({
  name: 'userRolesToStore'
})
export class UserRolesToStorePipe implements PipeTransform {

  transform(userRoles: UserRoleModel[]): string {
    
    const stores: StoreMinimalModel[] = userRoles.filter(x => x.store != null).map(x => x.store);

    return stores && stores.length > 0 ? (stores.length > 1 ? stores.length.toString() : stores[0].name) : "0";

  }

}
