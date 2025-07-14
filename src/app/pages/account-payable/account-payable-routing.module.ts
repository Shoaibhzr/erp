import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountPayableListComponent } from './account-payable-list/account-payable-list.component';
import { AccountPayableDetailsComponent } from './account-payable-details/account-payable-details.component';
import { AccountsPayableViewDetailsComponent } from './accounts-payable-view-details/accounts-payable-view-details.component';

const routes: Routes = [
  {
    path: '',
    component: AccountPayableListComponent,
  },
  {
    path: 'list',
    component: AccountPayableListComponent,
  },
  {
    path: 'details/:id',
    component: AccountPayableDetailsComponent,
  },
  {
    path: 'new',
    component: AccountPayableDetailsComponent,
  },
  {
    path: 'view/:id',
    component: AccountsPayableViewDetailsComponent,
  },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPayableRoutingModule {}
