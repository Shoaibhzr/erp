import { Pipe, PipeTransform } from '@angular/core';
import { QuotationStatus } from 'src/app/models/quotation-status';
import { PaymentMethod } from '../../models/payment-method';

@Pipe({
  name: 'paymentMethod'
})
export class PaymentMethodPipe implements PipeTransform {

  transform(paymentMethod: PaymentMethod): string {

    const statusMap: { [key in PaymentMethod]: string } = {
      [PaymentMethod.none]: "None",
      [PaymentMethod.eCheque]: "eCheque",
      [PaymentMethod.ach]: "ACH",
      [PaymentMethod.wire]: "Wire",
      [PaymentMethod.creditCard]: "Credit Card",
      [PaymentMethod.debitCard]: "Debit Card",
      [PaymentMethod.portal]: "Portal",
      [PaymentMethod.officeCheque]: "Office Cheque"
    };


    return statusMap[paymentMethod] || paymentMethod;

  }

}
