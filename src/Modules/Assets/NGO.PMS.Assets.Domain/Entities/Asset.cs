using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class Asset : AuditableEntity, ISoftDeletable
{
    public string AssetCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid AssetCategoryId { get; private set; }
    public string? SerialNumber { get; private set; }
    public string? ModelNumber { get; private set; }
    public string Location { get; private set; } = string.Empty;
    public Guid? DonorGrantId { get; private set; }
    public Guid? ProjectId { get; set; }
    public Guid? PurchaseOrderId { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    public decimal PurchaseCost { get; private set; }
    public decimal CurrentBookValue { get; private set; }
    public DepreciationMethod DepreciationMethod { get; private set; }
    public decimal UsefulLifeYears { get; private set; }
    public decimal ResidualValue { get; private set; }
    public decimal AnnualDepreciation { get; private set; }
    public decimal AccumulatedDepreciation { get; private set; }
    public AssetStatus Status { get; private set; } = AssetStatus.Active;
    public AssetCondition Condition { get; private set; } = AssetCondition.New;
    public Guid? AssignedToUserId { get; private set; }
    public string? AssignedToName { get; private set; }
    public DateTime? AssignmentDate { get; private set; }
    public string? Notes { get; private set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    public static Asset Create(
        string assetCode,
        string name,
        Guid categoryId,
        string location,
        DateTime purchaseDate,
        decimal purchaseCost,
        DepreciationMethod depreciationMethod,
        decimal usefulLifeYears,
        decimal residualValue,
        Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(assetCode))
            throw new ArgumentException("Asset code is required.", nameof(assetCode));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Asset name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(location))
            throw new ArgumentException("Location is required.", nameof(location));
        if (purchaseCost < 0)
            throw new ArgumentException("Purchase cost cannot be negative.", nameof(purchaseCost));
        if (usefulLifeYears <= 0)
            throw new ArgumentException("Useful life must be greater than zero.", nameof(usefulLifeYears));
        if (residualValue < 0)
            throw new ArgumentException("Residual value cannot be negative.", nameof(residualValue));

        var asset = new Asset
        {
            AssetCode = assetCode.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            AssetCategoryId = categoryId,
            Location = location.Trim(),
            PurchaseDate = purchaseDate,
            PurchaseCost = purchaseCost,
            CurrentBookValue = purchaseCost,
            DepreciationMethod = depreciationMethod,
            UsefulLifeYears = usefulLifeYears,
            ResidualValue = residualValue,
            OrganizationId = orgId,
            Status = AssetStatus.Active,
            Condition = AssetCondition.New
        };

        asset.AddDomainEvent(new AssetRegisteredEvent(asset.Id, asset.AssetCode, asset.Name));
        return asset;
    }

    public void UpdateDetails(string name, string? description, string? serialNumber, string? modelNumber)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Asset name is required.", nameof(name));

        Name = name.Trim();
        Description = description;
        SerialNumber = serialNumber;
        ModelNumber = modelNumber;
    }

    public void UpdateLocation(string location)
    {
        if (string.IsNullOrWhiteSpace(location))
            throw new ArgumentException("Location is required.", nameof(location));

        Location = location.Trim();
    }

    public void AssignTo(Guid userId, string userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
            throw new ArgumentException("Assigned user name is required.", nameof(userName));

        AssignedToUserId = userId;
        AssignedToName = userName.Trim();
        AssignmentDate = DateTime.UtcNow;
    }

    public void Unassign()
    {
        AssignedToUserId = null;
        AssignedToName = null;
        AssignmentDate = null;
    }

    /// <summary>
    /// Calculates depreciation based on the configured method.
    /// StraightLine: AnnualDepreciation = (PurchaseCost - ResidualValue) / UsefulLifeYears.
    /// ReducingBalance: rate = 1 - (ResidualValue / PurchaseCost)^(1/UsefulLifeYears).
    /// </summary>
    public void CalculateDepreciation(DateTime asOfDate)
    {
        if (Status == AssetStatus.Disposed)
            throw new InvalidOperationException("Cannot calculate depreciation for a disposed asset.");

        var yearsElapsed = (decimal)(asOfDate - PurchaseDate).TotalDays / 365.25m;
        if (yearsElapsed < 0) yearsElapsed = 0;

        switch (DepreciationMethod)
        {
            case Enums.DepreciationMethod.StraightLine:
                CalculateStraightLineDepreciation(yearsElapsed);
                break;
            case Enums.DepreciationMethod.ReducingBalance:
                CalculateReducingBalanceDepreciation(yearsElapsed);
                break;
            default:
                throw new InvalidOperationException($"Unsupported depreciation method: {DepreciationMethod}");
        }
    }

    private void CalculateStraightLineDepreciation(decimal yearsElapsed)
    {
        var depreciableAmount = PurchaseCost - ResidualValue;
        AnnualDepreciation = depreciableAmount / UsefulLifeYears;

        AccumulatedDepreciation = AnnualDepreciation * yearsElapsed;
        if (AccumulatedDepreciation > depreciableAmount)
            AccumulatedDepreciation = depreciableAmount;

        CurrentBookValue = PurchaseCost - AccumulatedDepreciation;
    }

    private void CalculateReducingBalanceDepreciation(decimal yearsElapsed)
    {
        if (PurchaseCost == 0)
        {
            AnnualDepreciation = 0;
            AccumulatedDepreciation = 0;
            CurrentBookValue = 0;
            return;
        }

        // rate = 1 - (ResidualValue / PurchaseCost)^(1/UsefulLifeYears)
        var ratio = (double)(ResidualValue / PurchaseCost);
        var exponent = 1.0 / (double)UsefulLifeYears;
        var rate = 1.0 - Math.Pow(ratio, exponent);

        var bookValue = (double)PurchaseCost;
        var totalDepreciation = 0.0;
        var fullYears = (int)Math.Floor((double)yearsElapsed);
        var fractionalYear = (double)yearsElapsed - fullYears;

        for (var i = 0; i < fullYears && bookValue > (double)ResidualValue; i++)
        {
            var yearDepreciation = bookValue * rate;
            if (bookValue - yearDepreciation < (double)ResidualValue)
                yearDepreciation = bookValue - (double)ResidualValue;

            totalDepreciation += yearDepreciation;
            bookValue -= yearDepreciation;
        }

        // Partial year
        if (fractionalYear > 0 && bookValue > (double)ResidualValue)
        {
            var partialDepreciation = bookValue * rate * fractionalYear;
            if (bookValue - partialDepreciation < (double)ResidualValue)
                partialDepreciation = bookValue - (double)ResidualValue;

            totalDepreciation += partialDepreciation;
            bookValue -= partialDepreciation;
        }

        AnnualDepreciation = (decimal)(bookValue * rate);
        AccumulatedDepreciation = (decimal)totalDepreciation;
        CurrentBookValue = PurchaseCost - AccumulatedDepreciation;
    }

    public void MarkInMaintenance()
    {
        EnsureNotDisposed();
        Status = AssetStatus.InMaintenance;
    }

    public void MarkActive()
    {
        EnsureNotDisposed();
        Status = AssetStatus.Active;
    }

    public void MarkLost()
    {
        EnsureNotDisposed();
        Status = AssetStatus.Lost;
    }

    public void LinkToDonor(Guid donorGrantId)
    {
        DonorGrantId = donorGrantId;
    }

    public void LinkToPurchaseOrder(Guid purchaseOrderId)
    {
        PurchaseOrderId = purchaseOrderId;
    }

    private void EnsureNotDisposed()
    {
        if (Status == AssetStatus.Disposed)
            throw new InvalidOperationException("Cannot modify a disposed asset.");
    }
}
