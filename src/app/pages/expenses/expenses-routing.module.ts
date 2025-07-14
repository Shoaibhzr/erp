import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesListComponent } from './expenses-list/expenses-list.component';
import { ExpensesFilterComponent } from './expenses/expenses-filter.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { DatePipe } from '@angular/common';
import { PriorityPipe } from 'src/app/pipes/priority/priority.pipe';
import { ServiceRequestStatusPipe } from 'src/app/pipes/service-request-status/service-request-status.pipe';
import { InvoiceTemplateComponent } from 'src/app/components/invoice-template/invoice-template.component';
const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
    },
    {
        path: 'list',
        component: ExpensesListComponent
    },
    {
        path: 'report',
        component: InvoiceTemplateComponent
    },
    {
        path: ':id/edit',
        component: ExpenseDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe, PriorityPipe, ServiceRequestStatusPipe ]
})
export class ExpensesRoutingModule { }