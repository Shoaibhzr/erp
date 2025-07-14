import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BehaviorSubject, finalize, take, tap } from 'rxjs';
import { AccountsPayableService } from 'src/app/services/accounts-payable.service';
import * as pdfjsLib from 'pdfjs-dist';
import { Entity } from 'src/app/models/ocr';

(
  pdfjsLib as any
).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${
  (pdfjsLib as any).version
}/pdf.worker.min.js`;

@Component({
  selector: 'app-ocr-dialog',
  templateUrl: './ocr-dialog.component.html',
  styleUrls: ['./ocr-dialog.component.scss'],
})
export class OcrDialogComponent {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  @Output() modalClose = new EventEmitter();
  selectedFile: File;
  isPdf: boolean = true;
  isLoading$ = new BehaviorSubject<boolean>(false);
  result: any = null;

  constructor(
    public bsModalRef: BsModalRef,
    private apSvc: AccountsPayableService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.result = null;
    }

    if (this.selectedFile.type === 'application/pdf') {
      this.isPdf = true;
      this.renderPDF();
    } else {
      this.isPdf = false;
      this.renderImage();
    }
  }

  renderPDF(): void {
    if (this.selectedFile) {
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        const typedarray = new Uint8Array(fileReader.result as ArrayBuffer);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = this.canvas.nativeElement;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
        }
      };

      fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }

  renderImage(): void {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = this.canvas.nativeElement;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(this.selectedFile);
  }

  startOCR() {
    this.isLoading$.next(true);
    this.apSvc
      .processDocument(this.selectedFile)
      .pipe(
        finalize(() => this.isLoading$.next(false)),
        take(1)
      )
      .subscribe((data) => {
        this.result = data.entities.reduce(
          (acc: { [key: string]: string }, item) => {
            acc[item.type] = item.mentionText;
            return acc;
          },
          {}
        );
        this.drawBoundingBoxes(data.entities);
      });
  }

  drawBoundingBoxes(entities: Entity[]) {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    entities.forEach((entity) => {
      const pageRefs = entity.pageAnchor?.pageRefs ?? [];
      if (!pageRefs.length) return;

      const poly = pageRefs[0].boundingPoly?.normalizedVertices;
      if (!poly || poly.length < 4) return;

      const points = poly.map((v: any) => ({
        x: v.x * width,
        y: v.y * height,
      }));

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    });
  }

  onUseValues() {
    const result = {
      accountsPayableDetails: {
        invoiceNumber: this.result?.invoice_id,
        invoiceDate: this.result?.invoice_date,
        invoiceAmount: Number(this.result?.amount_due) || null,
      },
      dueDate: this.result?.due_date,
    };
    this.modalClose.emit(result);
    this.bsModalRef.hide();
  }
}
