import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, forkJoin, interval, map, Subject, Subscription, takeUntil } from 'rxjs';

/** Models */
import { UserModel } from '../../models/user-model';
import { SidebarMenuItem } from '../../models/common';
import { RoleConstant } from '../../models/role-constant';
import { UserRoleModel } from '../../models/user-role-model';

/** Services */
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { UserService } from '../../services/user.service';
import { ServiceRequestType } from 'src/app/models/service-request-type';

@Component({
  selector: 'auth-layout',
  templateUrl: './auth.layout.html',
  providers: []
})
export class AuthLayout implements OnInit, OnDestroy {

  public user: UserModel;

  public role: string;

  public RoleConstant = RoleConstant;

  public SidebarMenuItem = SidebarMenuItem;

  public serviceRequestType = ServiceRequestType;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private authSvc: AuthService, private router: Router, private contextSvc: ContextService, private userSvc: UserService) {

  }

  ngOnInit() {

    this.contextSvc.user.pipe(takeUntil(this.ngUnSubscribe)).subscribe((x) => {

      this.user = x;

      const userRoles: string[] = [];

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.globalAdminId)) {

        userRoles.push("Global Admin");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.companyAdminId)) {

        userRoles.push("Company Admin");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.srDirectorOperations)) {

        userRoles.push("Sr Director Operations");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.directorOperations)) {

        userRoles.push("Director Operations");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.supervisor)) {

        userRoles.push("Supervisor");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.generalManager)) {

        userRoles.push("General Manager");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.employeeId)) {

        userRoles.push("Employee");

      }

      if (this.user.userRoles.some(x => x.roleId === RoleConstant.vendorId)) {

        userRoles.push("Vendor");

      }

      this.role = userRoles.join(", ");

    });

  }

  public checkIfUserHasRole(roleId: string): boolean {

    return this.user && this.user.userRoles && this.user.userRoles.some(x => x.roleId === roleId);

  }

  public logout(): void {

    this.authSvc.logout().subscribe(x => {

    });

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
