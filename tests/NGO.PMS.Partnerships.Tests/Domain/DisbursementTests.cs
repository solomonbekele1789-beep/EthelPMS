using FluentAssertions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Domain.Events;

namespace NGO.PMS.Partnerships.Tests.Domain;

public class DisbursementTests
{
    private static Disbursement CreateValidDisbursement(
        decimal amount = 50_000m,
        string currency = "USD")
    {
        return Disbursement.Create(
            organizationId: Guid.NewGuid(),
            subGranteeId: Guid.NewGuid(),
            grantId: Guid.NewGuid(),
            amount: amount,
            currency: currency,
            disbursementDate: DateTime.UtcNow,
            referenceNumber: "DISB-2024-001",
            purpose: "Q1 program implementation funds");
    }

    [Fact]
    public void Should_Create_Disbursement_As_Pending()
    {
        var disbursement = CreateValidDisbursement();

        disbursement.Should().NotBeNull();
        disbursement.Id.Should().NotBeEmpty();
        disbursement.Amount.Should().Be(50_000m);
        disbursement.Currency.Should().Be("USD");
        disbursement.Status.Should().Be(DisbursementStatus.Pending);
        disbursement.ApprovedById.Should().BeNull();
        disbursement.ApprovedAt.Should().BeNull();
        disbursement.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DisbursementCreatedEvent>();
    }

    [Fact]
    public void Should_Approve_Disbursement()
    {
        var disbursement = CreateValidDisbursement();
        var approverId = Guid.NewGuid();

        disbursement.Approve(approverId);

        disbursement.Status.Should().Be(DisbursementStatus.Approved);
        disbursement.ApprovedById.Should().Be(approverId);
        disbursement.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void Should_Disburse_Only_When_Approved()
    {
        var disbursement = CreateValidDisbursement();

        // Cannot disburse when Pending
        var actPending = () => disbursement.Disburse();
        actPending.Should().Throw<InvalidOperationException>()
            .WithMessage("*approved*");

        // Approve first, then disburse
        disbursement.Approve(Guid.NewGuid());
        disbursement.Disburse();

        disbursement.Status.Should().Be(DisbursementStatus.Disbursed);
    }

    [Fact]
    public void Should_Reject_Disbursement()
    {
        var disbursement = CreateValidDisbursement();

        disbursement.Reject();

        disbursement.Status.Should().Be(DisbursementStatus.Rejected);
    }
}
