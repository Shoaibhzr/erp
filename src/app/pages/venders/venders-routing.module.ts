import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VenderListViewComponent } from './vender-list-view/vender-list-view.component';
import { VenderCreatePage } from './vender-create/vender-create.page';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
    },
    {
        path: 'list',
        component: VenderListViewComponent
    },
    {
        path: 'create',
        component: VenderCreatePage
    },
    {
        path: ':id/edit',
        component: VenderCreatePage
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VendersRoutingModule { }
