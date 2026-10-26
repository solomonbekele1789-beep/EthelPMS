namespace NGO.PMS.Assets.Application.DTOs;

public class AssetCategoryDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DefaultDepreciationMethod { get; set; } = string.Empty;
    public decimal DefaultUsefulLifeYears { get; set; }
    public decimal DefaultResidualValuePercent { get; set; }
    public bool IsActive { get; set; }
}
