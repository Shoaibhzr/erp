import { CompanyMinimalModel } from "./company-minimal-model";

export class StoreModel {
  public id: string;
  public company: CompanyMinimalModel;
  public name: string;
  public phone: string;
  public address: string;
  public contactName: string;
  public contactEmail: string;
  public createdOn: Date;
}

export class StoreGroupModel {
  public id: string;
  public company: CompanyMinimalModel;
  public name: string;
  public phone: string;
  public address: string;
  public contactName: string;
  public contactEmail: string;
  public createdOn: Date;
}
