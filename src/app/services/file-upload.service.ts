import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  public upload(sasUrl: URL, file: File): Observable<string> {

    return new Observable<string>((observer) => {

      const storageAccountUrl: string = sasUrl.origin;

      const containerName: string = sasUrl.pathname.split('/')[1];

      const sasToken: string = sasUrl.search;

      const blobName: string = `${crypto.randomUUID()}.${file.name.split(/[#?]/)[0].split('.').pop().trim()}`;

      const blobServiceClient = new BlobServiceClient(`${storageAccountUrl}${sasToken}`);

      const containerClient = blobServiceClient.getContainerClient(`${containerName}`);

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      blockBlobClient
        .upload(file, file.size, { blobHTTPHeaders: { blobContentType: file.type } })
        .then((x) => {

          observer.next(`${storageAccountUrl}/${containerName}/${blobName}`);

          observer.complete();

        });

    });

  }

}
