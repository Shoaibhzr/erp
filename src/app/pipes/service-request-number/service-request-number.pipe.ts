import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestPriority } from '../../models/service-request-priority';
import { ServiceRequestStatus } from '../../models/service-request-status';
import { ServiceRequestModel } from '../../models/service-request-model';
import { ServiceRequestType } from '../../models/service-request-type';

@Pipe({
  name: 'ServiceRequestNumber'
})
export class ServiceRequestNumberPipe implements PipeTransform {

  transform(serviceRequestModel: ServiceRequestModel): string {

    const companyInitials = serviceRequestModel?.company?.name?.substring(0, 2).toUpperCase();

    const requestPrefix = serviceRequestModel?.type === ServiceRequestType.repairAndMainenance ? "RM" : (serviceRequestModel?.type === ServiceRequestType.expense ? "EX" : "AP");

    const number = serviceRequestModel?.number?.toString().padStart(7, '0');

    return `${companyInitials}-${requestPrefix}-${number}`;
  }

}
