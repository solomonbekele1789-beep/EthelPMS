using FluentAssertions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Tests.Domain;

public class FundRestrictionTests
{
    private readonly Guid _fundCodeId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    private FundRestriction CreateRestriction(decimal amount = 10000m) =>
        FundRestriction.Create(_fundCodeId, "Grant restriction", amount,
            "Must be used for education", null, _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var restriction = CreateRestriction();

        restriction.FundCodeId.Should().Be(_fundCodeId);
        restriction.Description.Should().Be("Grant restriction");
        restriction.OriginalAmount.Should().Be(10000m);
        restriction.RemainingAmount.Should().Be(10000m);
        restriction.ReleasedAmount.Should().Be(0);
        restriction.Status.Should().Be(RestrictionStatus.Active);
        restriction.ConditionDescription.Should().Be("Must be used for education");
        restriction.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Release_ValidAmount_UpdatesAmounts()
    {
        var restriction = CreateRestriction();

        restriction.Release(3000m);

        restriction.ReleasedAmount.Should().Be(3000m);
        restriction.RemainingAmount.Should().Be(7000m);
        restriction.Status.Should().Be(RestrictionStatus.PartiallyReleased);
    }

    [Fact]
    public void Release_ExceedsRemaining_ThrowsInvalidOperationException()
    {
        var restriction = CreateRestriction();

        var act = () => restriction.Release(11000m);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot release*");
    }
}
