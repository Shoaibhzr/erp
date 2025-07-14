import { Pipe, PipeTransform } from '@angular/core';
import { UserRoleModel } from '../../models/user-role-model';
import { RoleConstant } from '../../models/role-constant';

@Pipe({
  name: 'userRolesToRole'
})
export class UserRolesToRolePipe implements PipeTransform {

  transform(userRoles: UserRoleModel[]): string {

    const userRolesStr: string[] = [];

    if (userRoles.some(x => x.roleId === RoleConstant.globalAdminId)) {

      userRolesStr.push("Global Admin");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.companyAdminId)) {

      userRolesStr.push("Company Admin");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.srDirectorOperations)) {

      userRolesStr.push("Sr. Director Operations");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.directorOperations)) {

      userRolesStr.push("Director Operations");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.supervisor)) {

      userRolesStr.push("Supervisor");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.generalManager)) {

      userRolesStr.push("General Manager");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.employeeId)) {

      userRolesStr.push("Employee");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.vendorId)) {

      userRolesStr.push("Vendor");

    }

    if (userRoles.some(x => x.roleId === RoleConstant.auditor2)) {

      userRolesStr.push("Auditor2");

    }
      if (userRoles.some(x => x.roleId === RoleConstant.auditor1)) {

      userRolesStr.push("Auditor1");

    }
    if (userRoles.some(x => x.roleId === RoleConstant.accountsPayableManager1)) {

      userRolesStr.push("AP Manager 1");

    }
    if (userRoles.some(x => x.roleId === RoleConstant.accountsPayableManager2)) {

      userRolesStr.push("AP Manager 2");

    }
    if (userRoles.some(x => x.roleId === RoleConstant.accountsPayableCreator)) {

      userRolesStr.push("AP Creator");

    }
    if (userRoles.some(x => x.roleId === RoleConstant.vpOperations)) {

      userRolesStr.push("VP Operations");

    }

    return userRolesStr.join(", ");

  }

}
