using FluentAssertions;
using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.Risk.Domain.Events;
using RiskEntity = NGO.PMS.Risk.Domain.Entities.Risk;

namespace NGO.PMS.Risk.Tests.Domain;

public class RiskTests
{
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    private RiskEntity CreateDefaultRisk(
        Likelihood likelihood = Likelihood.Low,
        Impact impact = Impact.Minor)
    {
        return RiskEntity.Create(
            _projectId,
            "Test Risk",
            "Test risk description",
            likelihood,
            impact,
            _orgId);
    }

    [Fact]
    public void Create_ValidInput_ComputesScoreAndRaisesEvent()
    {
        var risk = RiskEntity.Create(
            _projectId,
            "Budget Overrun",
            "Risk of exceeding budget by 20%",
            Likelihood.High,
            Impact.Major,
            _orgId);

        risk.Title.Should().Be("Budget Overrun");
        risk.Description.Should().Be("Risk of exceeding budget by 20%");
        risk.Likelihood.Should().Be(Likelihood.High);
        risk.Impact.Should().Be(Impact.Major);
        risk.RiskScore.Should().Be(16); // High(4) * Major(4) = 16
        risk.Status.Should().Be(RiskStatus.Identified);
        risk.OrganizationId.Should().Be(_orgId);
        risk.IdentifiedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        risk.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<RiskIdentifiedEvent>();
    }

    [Fact]
    public void Reassess_IncreasedScore_RaisesEscalatedEvent()
    {
        // Start with Low(2) * Minor(2) = 4
        var risk = CreateDefaultRisk(Likelihood.Low, Impact.Minor);
        risk.RiskScore.Should().Be(4);

        // Clear domain events from Create
        risk.ClearDomainEvents();

        // Reassess to High(4) * Major(4) = 16
        risk.Reassess(Likelihood.High, Impact.Major);

        risk.RiskScore.Should().Be(16);
        risk.Status.Should().Be(RiskStatus.Assessed);
        risk.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<RiskEscalatedEvent>();

        var escalatedEvent = (RiskEscalatedEvent)risk.DomainEvents.Single();
        escalatedEvent.PreviousScore.Should().Be(4);
        escalatedEvent.NewScore.Should().Be(16);
    }

    [Fact]
    public void Reassess_DecreasedScore_DoesNotRaiseEscalatedEvent()
    {
        // Start with High(4) * Major(4) = 16
        var risk = CreateDefaultRisk(Likelihood.High, Impact.Major);
        risk.ClearDomainEvents();

        // Reassess to Low(2) * Minor(2) = 4
        risk.Reassess(Likelihood.Low, Impact.Minor);

        risk.RiskScore.Should().Be(4);
        risk.Status.Should().Be(RiskStatus.Assessed);
        risk.DomainEvents.Should().BeEmpty();
    }

    [Fact]
    public void Resolve_SetsStatusAndDate()
    {
        var risk = CreateDefaultRisk();

        risk.Resolve();

        risk.Status.Should().Be(RiskStatus.Resolved);
        risk.ResolvedDate.Should().NotBeNull();
        risk.ResolvedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Close_WithOpenMitigations_ThrowsInvalidOperationException()
    {
        var risk = CreateDefaultRisk();
        var mitigation = Domain.Entities.RiskMitigation.Create(
            risk.Id,
            "Hire additional staff",
            DateTime.UtcNow.AddDays(30));
        risk.Mitigations.Add(mitigation);

        var act = () => risk.Close();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*open mitigations*");
    }

    [Fact]
    public void Close_AllMitigationsCompleted_Succeeds()
    {
        var risk = CreateDefaultRisk();
        var mitigation = Domain.Entities.RiskMitigation.Create(
            risk.Id,
            "Hire additional staff",
            DateTime.UtcNow.AddDays(30));
        mitigation.Complete();
        risk.Mitigations.Add(mitigation);

        risk.Close();

        risk.Status.Should().Be(RiskStatus.Closed);
    }
}
