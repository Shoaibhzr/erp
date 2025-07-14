import { FileModel } from "../file-model";

export class CommentCreateRequestModel {
  public serviceRequestId: string;
  public replyToId: string;
  public body: string;
  public files: FileModel[];
}
