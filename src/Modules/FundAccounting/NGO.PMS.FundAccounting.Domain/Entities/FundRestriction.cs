using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class FundRestriction : AuditableEntity
{
    public Guid FundCodeId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal OriginalAmount { get; private set; }
    public decimal ReleasedAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public RestrictionStatus Status { get; private set; }
    public string? ConditionDescription { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public Guid OrganizationId { get; set; }

    private FundRestriction() { }

    public static FundRestriction Create(
        Guid fundCodeId,
        string description,
        decimal originalAmount,
        string? conditionDescription,
        DateTime? expiryDate,
        Guid orgId)
    {
        var restriction = new FundRestriction
        {
            FundCodeId = fundCodeId,
            Description = description,
            OriginalAmount = originalAmount,
            ReleasedAmount = 0,
            RemainingAmount = originalAmount,
            Status = RestrictionStatus.Active,
            ConditionDescription = conditionDescription,
            ExpiryDate = expiryDate,
            OrganizationId = orgId
        };

        return restriction;
    }

    public void Release(decimal amount)
    {
        if (amount <= 0)
            throw new InvalidOperationException("Release amount must be greater than zero.");

        if (amount > RemainingAmount)
            throw new InvalidOperationException(
                $"Cannot release {amount}. Remaining restricted amount is {RemainingAmount}.");

        ReleasedAmount += amount;
        RemainingAmount = OriginalAmount - ReleasedAmount;

        Status = RemainingAmount == 0
            ? RestrictionStatus.FullyReleased
            : RestrictionStatus.PartiallyReleased;

        AddDomainEvent(new FundRestrictionReleasedEvent(Id, amount));
    }
}
