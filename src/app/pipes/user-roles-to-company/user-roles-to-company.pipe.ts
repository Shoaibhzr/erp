import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';

@Pipe({
  name: 'userRolesToCompany'
})
export class UserRolesToCompanyPipe implements PipeTransform {

  transform(userRoles: UserRoleModel[]): string {

    return [...new Set(userRoles.filter(x => x.company != null).map(x => x.company.name))].join(', ');

  }

}
