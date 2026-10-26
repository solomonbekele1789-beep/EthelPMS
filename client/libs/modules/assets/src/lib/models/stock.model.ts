export type StockMovementType = 'Receipt' | 'Issue' | 'Return' | 'Adjustment' | 'Transfer';

export interface StockItemDto {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  storageLocation?: string;
}

export interface StockMovementDto {
  id: string;
  stockItemId: string;
  itemName: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  referenceNumber?: string;
  notes?: string;
  movementDate: string;
  projectId?: string;
}

export interface CreateStockItemRequest {
  itemCode: string;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  description?: string;
  storageLocation?: string;
}

export interface RecordStockMovementRequest {
  stockItemId: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  movementDate: string;
  referenceNumber?: string;
  notes?: string;
  projectId?: string;
}
