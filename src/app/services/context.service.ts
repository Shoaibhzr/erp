import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
/** Models */
import { UserModel } from '../models/user-model';
import { RoleConstant } from '../models/role-constant';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  public user: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(
    undefined
  );

  roles$ = this.user.pipe(
    map((user) => (user.userRoles || []).map((role) => role.roleId))
  );

  isAPCreator$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.accountsPayableCreator))
  );
  isAPManger1$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.accountsPayableManager1))
  );
  isAPManger2$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.accountsPayableManager2))
  );
  isAuditor1$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.auditor1))
  );
  isAuditor2$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.auditor2))
  );
  isCompanyAdmin$ = this.roles$.pipe(
    map((roleIds) => roleIds.includes(RoleConstant.companyAdminId))
  );
}
