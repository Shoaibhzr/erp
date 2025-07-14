import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestPriority } from '../../models/service-request-priority';
import { ServiceRequestStatus } from '../../models/service-request-status';

@Pipe({
  name: 'ServiceRequestStatus'
})
export class ServiceRequestStatusPipe implements PipeTransform {

  transform(serviceRequestStatus: ServiceRequestStatus): string {

    const statusMap: { [key in ServiceRequestStatus]: string } = {
      [ServiceRequestStatus.pendingApproval]: "Pending Approval",
      [ServiceRequestStatus.approved]: "Approved",
      [ServiceRequestStatus.rejected]: "Rejected",
      [ServiceRequestStatus.returned]: "Returned",
      [ServiceRequestStatus.withdrawn]: "Withdrawn",
      [ServiceRequestStatus.quotationRequested]: "Quotation Requested",
      [ServiceRequestStatus.vendorAssigned]: "Vendor Assigned",
      [ServiceRequestStatus.inProgress]: "In-progress",
      [ServiceRequestStatus.issueResolved]: "Fixed",
      [ServiceRequestStatus.awaitingInvoiceApproval]: "Awaiting Invoice Approval",
      [ServiceRequestStatus.invoiceApproved]: "Invoice Approved",
      [ServiceRequestStatus.invoiceRejected]: "Invoice Rejected",
      [ServiceRequestStatus.paymentPending]: "Payment Pending",
      [ServiceRequestStatus.paymentCompleted]: "Payment Completed",
      [ServiceRequestStatus.finalized]: "Completed",
      [ServiceRequestStatus.none]: serviceRequestStatus
    };


    return statusMap[serviceRequestStatus] || serviceRequestStatus;

  }

}
