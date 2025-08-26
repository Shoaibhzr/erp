import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

/** Component */
import { AppComponent } from './app.component';
import { AppLayout } from './layouts/app/app.layout';
import { AuthLayout } from './layouts/auth/auth.layout';

/** Modules */
import { AppLayoutModule } from './layouts/app/app.layout.module';
import { AuthLayoutModule } from './layouts/auth/auth.layout.module';
import { LoginPageModule } from './pages/login/login.page.module';
import { HomePageModule } from './pages/home/home.page.module';
import { CompanyCreatePageModule } from './pages/company-create/company-create.page.module';
import { StoreCreatePageModule } from './pages/store-create/store-create.page.module';
import { StoreListViewPageModule } from './pages/store-list-view/store-list-view.page.module';
import { CompanyListViewPageModule } from './pages/company-list-view/company-list-view.page.module';
import { RepairAndMaintenanceListViewPageModule } from './pages/repair-and-maintenance-list-view/repair-and-maintenance-list-view.page.module';
import { RepairAndMaintenanceDetailViewPageModule } from './pages/repair-and-maintenance-detail-view/repair-and-maintenance-detail-view.page.module';
import { UserListViewPageModule } from './pages/user-list-view/user-list-view.page.module';
import { UserCreatePageModule } from './pages/user-create/user-create.page.module';
import { ApprovalProcessListViewPageModule } from './pages/approval-process-list-view/approval-process-list-view.page.module';
import { ApprovalProcessCreatePageModule } from './pages/approval-process-create/approval-process-create.page.module';
import { StoreGroupListViewPageModule } from './pages/store-group-list-view/store-group-list-view.page.module';
import { StoreGroupCreatePageModule } from './pages/store-group-create/store-group-create.page.module';

/** Pages */
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { UserCreatePage } from './pages/user-create/user-create.page';
import { CompanyCreatePage } from './pages/company-create/company-create.page';
import { StoreCreatePage } from './pages/store-create/store-create.page';
import { UserListViewPage } from './pages/user-list-view/user-list-view.page';
import { StoreListViewPage } from './pages/store-list-view/store-list-view.page';
import { CompanyListViewPage } from './pages/company-list-view/company-list-view.page';
import { RepairAndMaintenanceListViewPage } from './pages/repair-and-maintenance-list-view/repair-and-maintenance-list-view.page';
import { RepairAndMaintenanceDetailViewPage } from './pages/repair-and-maintenance-detail-view/repair-and-maintenance-detail-view.page';
import { StoreGroupListViewPage } from './pages/store-group-list-view/store-group-list-view.page';
import { StoreGroupCreatePage } from './pages/store-group-create/store-group-create.page';

/** 3rd party modules */
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';

/** Interceptors */
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptor';

/** Services */
import { StorageService } from './services/storage.service';

/** Guards*/
import { AuthGuard } from './guards/auth.guard';
import { ConfigGuard } from './guards/config.guard';
import { ContextGuard } from './guards/context.guard';
import { IfNotLoggedInGuard } from './guards/if-not-logged-in.guard';
import { ApprovalProcessListViewPage } from './pages/approval-process-list-view/approval-process-list-view.page';
import { ApprovalProcessCreatePage } from './pages/approval-process-create/approval-process-create.page';
import { OtpComponent } from './components/otp/otp.component';
import { AttachmentsListComponent } from './components/attachments-list/attachments-list.component';
import { PackageComponent } from './components/package/package.component';
import { BasicInformationComponent } from './components/basic-information/basic-information.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    AttachmentsListComponent,
    PackageComponent,
    BasicInformationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppLayoutModule,
    AuthLayoutModule,
    NgSelectModule,
    FormsModule,
    LoginPageModule,
    HomePageModule,
    CompanyListViewPageModule,
    CompanyCreatePageModule,
    StoreCreatePageModule,
    StoreListViewPageModule,
    RepairAndMaintenanceListViewPageModule,
    RepairAndMaintenanceDetailViewPageModule,
    ApprovalProcessListViewPageModule,
    ApprovalProcessCreatePageModule,
    StoreGroupListViewPageModule,
    StoreGroupCreatePageModule,
    TranslateModule.forRoot(),
    ToastrModule.forRoot(),
    TooltipModule.forRoot(),
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
    }),
    RouterModule.forRoot([
      {
        path: '',
        component: AuthLayout,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            canActivate: [ContextGuard],
            children: [
              {
                path: '',
                component: HomePage,
              },
              {
                path: 'companies',
                children: [
                  {
                    path: 'list',
                    component: CompanyListViewPage,
                  },
                ],
              },
              {
                path: 'company',
                children: [
                  {
                    path: 'create',
                    component: CompanyCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: CompanyCreatePage,
                  },
                ],
              },
              {
                path: 'stores',
                children: [
                  {
                    path: 'list',
                    component: StoreListViewPage,
                  },
                ],
              },
              {
                path: 'store',
                children: [
                  {
                    path: 'create',
                    component: StoreCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: StoreCreatePage,
                  },
                ],
              },
              {
                path: 'approval-processes',
                children: [
                  {
                    path: 'list',
                    component: ApprovalProcessListViewPage,
                  },
                ],
              },
              {
                path: 'approval-process',
                children: [
                  {
                    path: 'create',
                    component: ApprovalProcessCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: ApprovalProcessCreatePage,
                  },
                ],
              },
              {
                path: 'repairs-and-maintenance',
                children: [
                  {
                    path: 'list',
                    component: RepairAndMaintenanceListViewPage,
                  },
                  {
                    path: ':id/detail',
                    component: RepairAndMaintenanceDetailViewPage,
                  },
                ],
              },
              {
                path: 'users',
                children: [
                  {
                    path: 'list',
                    component: UserListViewPage,
                  },
                ],
              },
              {
                path: 'user',
                children: [
                  {
                    path: 'create',
                    component: UserCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: UserCreatePage,
                  },
                ],
              },
              {
                path: 'vendors',
                loadChildren: () =>
                  import('./pages/venders/venders.module').then(
                    (m) => m.VendersModule
                  ),
              },
              {
                path: 'profile',
                loadChildren: () =>
                  import('./pages/profile/profile.module').then(
                    (m) => m.ProfileModule
                  ),
              },
              {
                path: 'expenses',
                loadChildren: () =>
                  import('./pages/expenses/expenses.module').then(
                    (m) => m.ExpensesModule
                  ),
              },
              {
                path: 'accounts-payable',
                loadChildren: () =>
                  import('./pages/account-payable/account-payable.module').then(
                    (m) => m.AccountPayableModule
                  ),
              },
              {
                path: 'store-groups',
                children: [
                  {
                    path: 'list',
                    component: StoreGroupListViewPage,
                  },
                  {
                    path: ':id/detail',
                    component: StoreGroupCreatePage,
                  },
                  {
                    path: 'create',
                    component: StoreGroupCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: StoreGroupCreatePage,
                  },
                ],
              },
              {
                path: 'store-group',
                children: [
                  {
                    path: 'create',
                    component: StoreGroupCreatePage,
                  },
                  {
                    path: ':id/edit',
                    component: StoreGroupCreatePage,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'packages',
        canActivate: [IfNotLoggedInGuard],
        children: [
          {
            path: '',
            component: PackageComponent,
          },
        ],
      },
      {
        path: 'basicInfo',
        canActivate: [IfNotLoggedInGuard],
        children: [
          {
            path: '',
            component: BasicInformationComponent,
          },
        ],
      },
      {
        path: 'login',
        canActivate: [IfNotLoggedInGuard],
        children: [
          {
            path: '',
            component: LoginPage,
          },
        ],
      },
      {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
          import('./pages/error/error.page.module').then(
            (m) => m.ErrorPageModule
          ),
      },
    ]),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
      deps: [StorageService],
    },
    ConfigGuard,
    ContextGuard,
    AuthGuard,
    IfNotLoggedInGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
