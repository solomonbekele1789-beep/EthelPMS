export interface LocationDto {
  id: string;
  name: string;
  nameAm: string | null;
  level: string;
  parentId: string | null;
}

export interface LocationTreeNode extends LocationDto {
  children: LocationTreeNode[];
  expanded?: boolean;
}
