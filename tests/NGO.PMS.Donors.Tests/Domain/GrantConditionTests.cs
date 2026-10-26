using FluentAssertions;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.Donors.Domain.Events;

namespace NGO.PMS.Donors.Tests.Domain;

public class GrantConditionTests
{
    private readonly Guid _grantId = Guid.NewGuid();

    [Fact]
    public void Create_ValidInput_ReturnsCondition()
    {
        var dueDate = DateTime.UtcNow.AddDays(60);

        var condition = GrantCondition.Create(_grantId, "Submit quarterly report", dueDate);

        condition.Should().NotBeNull();
        condition.GrantId.Should().Be(_grantId);
        condition.Description.Should().Be("Submit quarterly report");
        condition.DueDate.Should().Be(dueDate);
        condition.Status.Should().Be(ConditionStatus.Pending);
        condition.CompletedDate.Should().BeNull();
        condition.CompletionNotes.Should().BeNull();
    }

    [Fact]
    public void MarkMet_SetsStatusAndCompletedDate()
    {
        var condition = GrantCondition.Create(_grantId, "Submit audit report", DateTime.UtcNow.AddDays(30));

        condition.MarkMet("Audit report submitted on time");

        condition.Status.Should().Be(ConditionStatus.Met);
        condition.CompletionNotes.Should().Be("Audit report submitted on time");
        condition.CompletedDate.Should().NotBeNull();
        condition.CompletedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void MarkOverdue_RaisesGrantConditionOverdueEvent()
    {
        var dueDate = DateTime.UtcNow.AddDays(-10);
        var condition = GrantCondition.Create(_grantId, "Financial reconciliation", dueDate);

        condition.MarkOverdue();

        condition.Status.Should().Be(ConditionStatus.Overdue);
        condition.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<GrantConditionOverdueEvent>();

        var overdueEvent = (GrantConditionOverdueEvent)condition.DomainEvents.Single();
        overdueEvent.ConditionId.Should().Be(condition.Id);
        overdueEvent.GrantId.Should().Be(_grantId);
        overdueEvent.DueDate.Should().Be(dueDate);
    }
}
