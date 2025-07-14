export enum ServiceRequestStatus {
  none = "None",
  pendingApproval = "PendingApproval",
  approved = "Approved",
  rejected = "Rejected",
  returned = "Returned",
  withdrawn = "Withdrawn",
  quotationRequested = "QuotationRequested",
  vendorAssigned = "VendorAssigned",
  inProgress = "InProgress",
  issueResolved = "IssueResolved",
  awaitingInvoiceApproval = "AwaitingInvoiceApproval",
  invoiceApproved = "InvoiceApproved",
  invoiceRejected = "InvoiceRejected",
  paymentPending = "PaymentPending",
  paymentCompleted = "PaymentCompleted",
  finalized = "Finalized"
}
