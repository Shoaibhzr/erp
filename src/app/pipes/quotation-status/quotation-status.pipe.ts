import { Pipe, PipeTransform } from '@angular/core';
import { QuotationStatus } from 'src/app/models/quotation-status';

@Pipe({
  name: 'quotationStatus'
})
export class QuotationStatusPipe implements PipeTransform {

  transform(quotationStatus: QuotationStatus): string {

    const statusMap: { [key in QuotationStatus]: string } = {
      [QuotationStatus.none]: "Awaiting Response",
      [QuotationStatus.pending]: "Pending Approval",
      [QuotationStatus.approved]: "Approved",
      [QuotationStatus.rejected]: "Rejected"
    };


    return statusMap[quotationStatus] || quotationStatus;

  }

}
