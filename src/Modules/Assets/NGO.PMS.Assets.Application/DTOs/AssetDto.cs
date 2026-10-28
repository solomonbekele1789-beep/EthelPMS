namespace NGO.PMS.Assets.Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid AssetCategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? ModelNumber { get; set; }
    public string Location { get; set; } = string.Empty;
    public Guid? DonorGrantId { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal PurchaseCost { get; set; }
    public decimal CurrentBookValue { get; set; }
    public string DepreciationMethod { get; set; } = string.Empty;
    public decimal UsefulLifeYears { get; set; }
    public decimal AnnualDepreciation { get; set; }
    public decimal AccumulatedDepreciation { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string? AssignedToName { get; set; }
}
