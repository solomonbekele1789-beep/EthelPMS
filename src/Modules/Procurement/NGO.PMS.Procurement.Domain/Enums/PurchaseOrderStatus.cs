namespace NGO.PMS.Procurement.Domain.Enums;

public enum PurchaseOrderStatus
{
    Draft = 1,
    Issued = 2,
    PartiallyReceived = 3,
    FullyReceived = 4,
    Closed = 5,
    Cancelled = 6
}
