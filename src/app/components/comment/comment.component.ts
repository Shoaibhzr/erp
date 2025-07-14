import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';

/** Models */
import { CommentModel, CommentViewModel } from '../../models/comment-model';
import { PagedList } from '../../models/common/paged-list';
import { CommentSearchRequestModel } from '../../models/request/comment-search-request-model';

/** Services */
import { CommentService } from '../../services/comment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentCreateRequestModel } from '../../models/request/comment-create-request-model';
import { ContextService } from '../../services/context.service';
import { Helpers } from 'src/app/utils/helpers-util';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CommentComponent implements OnInit, OnDestroy {

  @Input()
  public serviceRequestId: string;

  @Input()
  public comments: CommentViewModel[];

  public FileHelper = Helpers;

  public isCreateInProgress: boolean;

  public form!: FormGroup;

  public files: File[];

  public replyTo: CommentViewModel;

  private ngUnSubscribe: Subject<void> = new Subject<void>();

  constructor(private cd: ChangeDetectorRef, private commentSvc: CommentService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private contextSvc: ContextService) {

  }

  ngOnInit() {

    this.form = this.fb.group({
      serviceRequestId: [this.serviceRequestId, [Validators.required]],
      replyToId: [null],
      body: [null, [Validators.required]]
    });

    if (this.comments && this.comments.length > 0) {

      var comments = this.comments.filter(x => x.replyToId == null);

      comments.forEach(c => {

        c.replies = this.comments.filter(y => y.replyToId == c.id);

      });

      this.comments = comments;

    }

  }

  public create(): void {

    this.isCreateInProgress = true;

    this.markForCheck();

    var commentCreateRequestModel: CommentCreateRequestModel = this.form.getRawValue();

    new Observable<void>(observer => {

      if (this.files && this.files.length > 0) {

        const forkJoinInput: any[] = [];

        for (let i = 0; i < this.files.length; i++) {

          const formData = new FormData();

          formData.append("File", this.files[i]);

          forkJoinInput.push(this.commentSvc.uploadAttachmentAsync(formData));

        }

        forkJoin(forkJoinInput).pipe(takeUntil(this.ngUnSubscribe)).subscribe(fileModels => {

          commentCreateRequestModel.files = fileModels;

          observer.next(null);

          observer.complete();

        });

      }
      else {

        observer.next(null);

        observer.complete();

      }

    }).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {

      this.commentSvc.createAsync(commentCreateRequestModel).pipe(takeUntil(this.ngUnSubscribe)).subscribe(x => {

        const comment = <CommentViewModel>x;

        comment.createdBy = this.contextSvc.user.getValue();

        if (comment.replyToId) {

          const oldComment: CommentViewModel = this.comments.find(x => x.id == comment.replyToId);

          if (!oldComment.replies) {

            oldComment.replies = [];

          }

          oldComment.replies.unshift(comment);

        }
        else {

          if (!this.comments) {

            this.comments = [];

          }

          this.comments.unshift(comment);

        }

        delete this.files;

        this.form.get('replyToId').patchValue(null);

        this.form.get('body').patchValue(null);

        delete this.replyTo;

        this.isCreateInProgress = false;

        this.markForCheck();

      });

    });

  }

  public onAttachmentsChanged(event: any): void {
    
    this.files = event.target.files;

    this.markForCheck();

  }

  public removeAttachments(): void {

    delete this.files;

    this.markForCheck();

  }

  public reply(comment: CommentViewModel): void {

    this.replyTo = comment;

    this.form.get('replyToId').patchValue(this.replyTo.id);

    this.markForCheck();

  }

  public removeReply(): void {

    delete this.replyTo;

    this.form.get('replyToId').setValue(null);

    this.markForCheck();

  }

  public truncate(value: string): string {

    if (value.length > 500) {

      return value.slice(0, 150) + '...';

    }
    else {

      return value;

    }

  }

  private markForCheck(): void {

    this.cd.markForCheck();

  }

  ngOnDestroy() {

    this.ngUnSubscribe.next();

    this.ngUnSubscribe.complete();

  }

}
