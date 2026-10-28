using FluentAssertions;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.Risk.Domain.Events;

namespace NGO.PMS.Risk.Tests.Domain;

public class RiskMitigationTests
{
    private readonly Guid _riskId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_ReturnsMitigation()
    {
        var plannedDate = DateTime.UtcNow.AddDays(14);

        var mitigation = RiskMitigation.Create(
            _riskId,
            "Hire additional security staff",
            plannedDate,
            responsiblePerson: "Jane Doe",
            estimatedCost: 5000m);

        mitigation.RiskId.Should().Be(_riskId);
        mitigation.Action.Should().Be("Hire additional security staff");
        mitigation.PlannedDate.Should().Be(plannedDate);
        mitigation.ResponsiblePerson.Should().Be("Jane Doe");
        mitigation.EstimatedCost.Should().Be(5000m);
        mitigation.Status.Should().Be(MitigationStatus.Planned);
        mitigation.CompletedDate.Should().BeNull();
    }

    [Fact]
    public void Start_SetsInProgressStatus()
    {
        var mitigation = RiskMitigation.Create(
            _riskId,
            "Conduct training",
            DateTime.UtcNow.AddDays(7));

        mitigation.Start();

        mitigation.Status.Should().Be(MitigationStatus.InProgress);
    }

    [Fact]
    public void Complete_RaisesEvent()
    {
        var mitigation = RiskMitigation.Create(
            _riskId,
            "Install fire suppression system",
            DateTime.UtcNow.AddDays(30));

        mitigation.Complete();

        mitigation.Status.Should().Be(MitigationStatus.Completed);
        mitigation.CompletedDate.Should().NotBeNull();
        mitigation.CompletedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        mitigation.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<MitigationCompletedEvent>();

        var completedEvent = (MitigationCompletedEvent)mitigation.DomainEvents.Single();
        completedEvent.MitigationId.Should().Be(mitigation.Id);
        completedEvent.RiskId.Should().Be(_riskId);
    }

    [Fact]
    public void MarkOverdue_SetsOverdueStatus()
    {
        var mitigation = RiskMitigation.Create(
            _riskId,
            "Procure backup generators",
            DateTime.UtcNow.AddDays(-5));

        mitigation.MarkOverdue();

        mitigation.Status.Should().Be(MitigationStatus.Overdue);
    }
}
