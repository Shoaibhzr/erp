import { FileModel } from "./file-model";
import { UserMinimalModel } from "./user-minimal-model";

export class CommentModel {
  public id: string;
  public serviceRequestId: string;
  public replyToId: string;
  public body: string;
  public files: FileModel[];
  public createdBy: UserMinimalModel;
  public createdOn: Date;
  public updatedOn: Date;
  public isDeleted: boolean;
}

export class CommentViewModel extends CommentModel {
  public replies: CommentModel[];
}
