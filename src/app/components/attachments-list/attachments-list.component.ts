import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { FileModel } from '../../models/file-model';
import { Helpers } from '../../utils/helpers-util';

@Component({
  selector: 'attachments-list',
  templateUrl: './attachments-list.component.html'
})
export class AttachmentsListComponent {

  @Input()
  public files: FileModel[];

  @Output()
  public onClosed: EventEmitter<void> = new EventEmitter();

  public isHttpRequestInProgress: boolean = false;

  public FileHelper = Helpers;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef) {

  }

  ngOnInit() {

  }

  getFileIcon(fileType: string): string {
    return fileType === 'pdf' ? 'assets/pdf-icon.png' : 'assets/doc-icon.png';
  }

  viewFile(file: FileModel) {

    window.open(file.webUrl);

  }

  downloadFile(file: FileModel) {

    this.FileHelper.downloadFile(file.webUrl, file.name)

  }


  public close(): void {

    this.onClosed.emit();

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
