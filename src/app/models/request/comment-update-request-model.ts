import { FileModel } from "../file-model";
import { CommentCreateRequestModel } from "./comment-create-request-model";

export class CommentUpdateRequestModel extends CommentCreateRequestModel {
  public id: string;
}
