export interface Ocr {
  text: string;
  pages: number;
  entities: Entity[];
  formFields: FormFields;
  tables: any[];
  filePath: string;
  mimeType: string;
}

export interface Entity {
  properties: Property[];
  textAnchor: TextAnchor | null;
  type: string;
  mentionText: string;
  mentionId: string;
  confidence: number;
  pageAnchor: PageAnchor | null;
  id: string;
  normalizedValue: EntityNormalizedValue | null;
  provenance: null;
  redacted: boolean;
}

export interface EntityNormalizedValue {
  text: string;
  dateValue?: DateValue;
  structuredValue?: string;
  moneyValue?: MoneyValue;
  addressValue?: AddressValue;
}

export interface AddressValue {
  addressLines: string[];
  recipients: any[];
  revision: number;
  regionCode: string;
  languageCode: string;
  postalCode: string;
  sortingCode: string;
  administrativeArea: string;
  locality: string;
  sublocality: string;
  organization: string;
}

export interface DateValue {
  year: number;
  month: number;
  day: number;
}

export interface MoneyValue {
  currencyCode: string;
  units: string;
  nanos: number;
}

export interface PageAnchor {
  pageRefs: PageRef[];
}

export interface PageRef {
  page: string;
  layoutType: LayoutType;
  layoutId: string;
  boundingPoly: BoundingPoly | null;
  confidence: number;
}

export interface BoundingPoly {
  vertices: any[];
  normalizedVertices: NormalizedVertex[];
}

export interface NormalizedVertex {
  x: number;
  y: number;
}

export enum LayoutType {
  LayoutTypeUnspecified = 'LAYOUT_TYPE_UNSPECIFIED',
}

export interface Property {
  properties: any[];
  textAnchor: TextAnchor;
  type: string;
  mentionText: string;
  mentionId: string;
  confidence: number;
  pageAnchor: PageAnchor;
  id: string;
  normalizedValue: PropertyNormalizedValue | null;
  provenance: null;
  redacted: boolean;
}

export interface PropertyNormalizedValue {
  text: string;
  moneyValue: MoneyValue;
  structuredValue: string;
}

export interface TextAnchor {
  textSegments: TextSegment[];
  content: string;
}

export interface TextSegment {
  startIndex: string;
  endIndex: string;
}

export interface FormFields {}
