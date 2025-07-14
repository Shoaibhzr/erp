import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { StoreGroupListViewPage } from './store-group-list-view.page';
import { CustomPaginationComponent } from "../../components/custom-pagination/custom-pagination.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { UserRolesToStorePipeModule } from "../../pipes/user-roles-to-store/user-roles-to-store.pipe.module";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { UserPrefixPipeModule } from 'src/app/pipes/user-prefix/user-prefix.pipe.module';


@NgModule({
  declarations: [
    StoreGroupListViewPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CustomPaginationComponent,
    SpinnerComponent,
    ReactiveFormsModule,
    UserPrefixPipeModule,
    UserRolesToStorePipeModule,
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot()
]
})
export class StoreGroupListViewPageModule { }