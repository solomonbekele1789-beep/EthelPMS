using FluentAssertions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.Donors.Domain.Events;

namespace NGO.PMS.Donors.Tests.Domain;

public class GrantTests
{
    private readonly Guid _donorId = Guid.NewGuid();

    private Grant CreateDefaultGrant(GrantStatus status = GrantStatus.Draft)
    {
        return Grant.Create(
            _donorId,
            "GRT-001",
            "Test Grant",
            status,
            100_000m,
            "USD",
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(1),
            "Test description",
            null);
    }

    [Fact]
    public void Create_Active_RaisesGrantActivatedEvent()
    {
        var grant = CreateDefaultGrant(GrantStatus.Active);

        grant.Status.Should().Be(GrantStatus.Active);
        grant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<GrantActivatedEvent>();

        var activatedEvent = (GrantActivatedEvent)grant.DomainEvents.Single();
        activatedEvent.GrantId.Should().Be(grant.Id);
        activatedEvent.DonorId.Should().Be(_donorId);
        activatedEvent.TotalAmount.Should().Be(100_000m);
    }

    [Fact]
    public void Create_Draft_DoesNotRaiseEvent()
    {
        var grant = CreateDefaultGrant(GrantStatus.Draft);

        grant.Status.Should().Be(GrantStatus.Draft);
        grant.DomainEvents.Should().BeEmpty();
    }

    [Fact]
    public void Activate_FromDraft_RaisesEvent()
    {
        var grant = CreateDefaultGrant(GrantStatus.Draft);

        grant.Activate();

        grant.Status.Should().Be(GrantStatus.Active);
        grant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<GrantActivatedEvent>();

        var activatedEvent = (GrantActivatedEvent)grant.DomainEvents.Single();
        activatedEvent.GrantId.Should().Be(grant.Id);
        activatedEvent.DonorId.Should().Be(_donorId);
        activatedEvent.TotalAmount.Should().Be(100_000m);
    }

    [Fact]
    public void Activate_FromNonDraft_ThrowsInvalidOperationException()
    {
        var grant = CreateDefaultGrant(GrantStatus.Active);
        grant.ClearDomainEvents();

        var act = () => grant.Activate();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*draft*");
    }

    [Fact]
    public void UpdateComplianceStatus_Changed_RaisesComplianceStatusChangedEvent()
    {
        var grant = CreateDefaultGrant(GrantStatus.Active);
        grant.ClearDomainEvents();
        grant.ComplianceStatus.Should().Be(ComplianceStatus.Green);

        grant.UpdateComplianceStatus(ComplianceStatus.Red);

        grant.ComplianceStatus.Should().Be(ComplianceStatus.Red);
        grant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ComplianceStatusChangedEvent>();

        var changedEvent = (ComplianceStatusChangedEvent)grant.DomainEvents.Single();
        changedEvent.GrantId.Should().Be(grant.Id);
        changedEvent.OldStatus.Should().Be(ComplianceStatus.Green);
        changedEvent.NewStatus.Should().Be(ComplianceStatus.Red);
    }

    [Fact]
    public void UpdateComplianceStatus_Same_NoEvent()
    {
        var grant = CreateDefaultGrant(GrantStatus.Active);
        grant.ClearDomainEvents();
        grant.ComplianceStatus.Should().Be(ComplianceStatus.Green);

        grant.UpdateComplianceStatus(ComplianceStatus.Green);

        grant.ComplianceStatus.Should().Be(ComplianceStatus.Green);
        grant.DomainEvents.Should().BeEmpty();
    }
}
