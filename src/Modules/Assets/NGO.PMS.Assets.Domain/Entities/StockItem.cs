using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class StockItem : AuditableEntity, ISoftDeletable
{
    public string ItemCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public decimal QuantityOnHand { get; private set; }
    public decimal ReorderLevel { get; private set; }
    public decimal UnitCost { get; private set; }
    public string? StorageLocation { get; private set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    public static StockItem Create(
        string itemCode,
        string name,
        string category,
        string unit,
        decimal reorderLevel,
        decimal unitCost,
        Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(itemCode))
            throw new ArgumentException("Item code is required.", nameof(itemCode));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Item name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(category))
            throw new ArgumentException("Category is required.", nameof(category));
        if (string.IsNullOrWhiteSpace(unit))
            throw new ArgumentException("Unit is required.", nameof(unit));
        if (reorderLevel < 0)
            throw new ArgumentException("Reorder level cannot be negative.", nameof(reorderLevel));
        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(unitCost));

        return new StockItem
        {
            ItemCode = itemCode.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            Category = category.Trim(),
            Unit = unit.Trim(),
            ReorderLevel = reorderLevel,
            UnitCost = unitCost,
            QuantityOnHand = 0,
            OrganizationId = orgId
        };
    }

    public void UpdateQuantity(decimal newQuantity)
    {
        if (newQuantity < 0)
            throw new ArgumentException("Quantity cannot be negative.", nameof(newQuantity));

        QuantityOnHand = newQuantity;
    }

    public void UpdateDetails(string name, string? description, decimal reorderLevel, decimal unitCost)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Item name is required.", nameof(name));
        if (reorderLevel < 0)
            throw new ArgumentException("Reorder level cannot be negative.", nameof(reorderLevel));
        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(unitCost));

        Name = name.Trim();
        Description = description;
        ReorderLevel = reorderLevel;
        UnitCost = unitCost;
    }
}
