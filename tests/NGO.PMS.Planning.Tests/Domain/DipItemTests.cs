using FluentAssertions;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Domain.Events;

namespace NGO.PMS.Planning.Tests.Domain;

public class DipItemTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _activityId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldSetTitleAndRaiseDomainEvent()
    {
        var dip = DipItem.Create(_activityId, _projectId, "Procure supplies",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), 5_000m, _orgId);

        dip.Title.Should().Be("Procure supplies");
        dip.Status.Should().Be(DipStatus.NotStarted);
        dip.ActivityId.Should().Be(_activityId);
        dip.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DipItemCreatedEvent>();
    }

    [Fact]
    public void Create_ShouldThrow_WhenTitleEmpty()
    {
        var act = () => DipItem.Create(_activityId, _projectId, "",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), 0, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*title*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenNegativeBudget()
    {
        var act = () => DipItem.Create(_activityId, _projectId, "Test",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), -100m, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*negative*");
    }

    [Fact]
    public void AssignUser_ShouldSetResponsibleUserId()
    {
        var dip = DipItem.Create(_activityId, _projectId, "Task",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), 1_000m, _orgId);
        var userId = Guid.NewGuid();

        dip.AssignUser(userId);
        dip.ResponsibleUserId.Should().Be(userId);

        dip.UnassignUser();
        dip.ResponsibleUserId.Should().BeNull();
    }
}
