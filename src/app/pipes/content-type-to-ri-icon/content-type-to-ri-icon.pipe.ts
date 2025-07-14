import { Pipe, PipeTransform } from '@angular/core';
import { ServiceRequestPriority } from '../../models/service-request-priority';

@Pipe({
  name: 'contentTypeToRiIcon'
})
export class ContentTypeToRiIconPipe implements PipeTransform {

  transform(contentType: string): string {

    let typeToIcon: string = "ri-file-line";

    if (contentType === "application/zip") {

      typeToIcon = "ri-folder-zip-line";

    }
    else if (contentType === "application/pdf") {

      typeToIcon = "ri-file-pdf-line";

    }
    else if (contentType.startsWith("image")) {

      typeToIcon = "ri-image-line";

    }

    return typeToIcon;

  }

}
