using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class AssetCategory : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DepreciationMethod DefaultDepreciationMethod { get; private set; }
    public decimal DefaultUsefulLifeYears { get; private set; }
    public decimal DefaultResidualValuePercent { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static AssetCategory Create(
        string code,
        string name,
        DepreciationMethod defaultMethod,
        decimal defaultUsefulLife,
        decimal defaultResidualPercent,
        Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Category code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name is required.", nameof(name));
        if (defaultUsefulLife <= 0)
            throw new ArgumentException("Useful life must be greater than zero.", nameof(defaultUsefulLife));
        if (defaultResidualPercent < 0 || defaultResidualPercent > 100)
            throw new ArgumentException("Residual value percent must be between 0 and 100.", nameof(defaultResidualPercent));

        return new AssetCategory
        {
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            DefaultDepreciationMethod = defaultMethod,
            DefaultUsefulLifeYears = defaultUsefulLife,
            DefaultResidualValuePercent = defaultResidualPercent,
            OrganizationId = orgId,
            IsActive = true
        };
    }

    public void Update(
        string name,
        string? description,
        DepreciationMethod method,
        decimal usefulLife,
        decimal residualPercent)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name is required.", nameof(name));
        if (usefulLife <= 0)
            throw new ArgumentException("Useful life must be greater than zero.", nameof(usefulLife));
        if (residualPercent < 0 || residualPercent > 100)
            throw new ArgumentException("Residual value percent must be between 0 and 100.", nameof(residualPercent));

        Name = name.Trim();
        Description = description;
        DefaultDepreciationMethod = method;
        DefaultUsefulLifeYears = usefulLife;
        DefaultResidualValuePercent = residualPercent;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
