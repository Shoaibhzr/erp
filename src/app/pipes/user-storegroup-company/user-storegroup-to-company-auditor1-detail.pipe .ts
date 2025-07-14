import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';
import { RoleConstant } from 'src/app/models/role-constant';

@Pipe({
  name: 'userStoreGroupToCompanyAuditor1Detail'
})
export class UserStoreGroupToCompanyAuditor1DetailPipe implements PipeTransform {

  transform(userRoles: UserRoleModel[]): string {

    if (!userRoles || userRoles.length === 0) {
      return '';
    }

    return [...new Set(userRoles.filter(x => x.roleId == RoleConstant.auditor1 &&  x.group != null ).map(x => x.group.name))].join(', ');

  }

}
