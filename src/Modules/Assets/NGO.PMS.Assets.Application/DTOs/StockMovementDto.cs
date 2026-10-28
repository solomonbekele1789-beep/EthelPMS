namespace NGO.PMS.Assets.Application.DTOs;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid StockItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; }
    public Guid? ProjectId { get; set; }
}
