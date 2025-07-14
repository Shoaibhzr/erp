import { Pipe, PipeTransform } from '@angular/core';
import { QuotationStatus } from 'src/app/models/quotation-status';
import { InvoiceStatus } from '../../models/invoice-status';

@Pipe({
  name: 'invoiceStatus'
})
export class InvoiceStatusPipe implements PipeTransform {

  transform(invoiceStatus: InvoiceStatus): string {

    const statusMap: { [key in InvoiceStatus]: string } = {
      [InvoiceStatus.none]: "Pending Approval",
      [InvoiceStatus.pending]: "Pending Approval",
      [InvoiceStatus.approved]: "Approved",
      [InvoiceStatus.rejected]: "Rejected"
    };


    return statusMap[invoiceStatus] || invoiceStatus;

  }

}
