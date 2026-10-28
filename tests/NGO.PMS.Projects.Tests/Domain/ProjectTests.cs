using FluentAssertions;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.Projects.Domain.Enums;
using NGO.PMS.Projects.Domain.Events;

namespace NGO.PMS.Projects.Tests.Domain;

public class ProjectTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _currencyId = Guid.NewGuid();

    private Project CreateDraftProject()
        => Project.Create("PRJ-001", "Test Project",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            500_000m, _currencyId, _orgId);

    [Fact]
    public void Create_ShouldSetDraftStatus_And_UppercaseCode()
    {
        var project = Project.Create("prj-001", "Test Project",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            100_000m, _currencyId, _orgId);

        project.Code.Should().Be("PRJ-001");
        project.Status.Should().Be(ProjectStatus.Draft);
        project.OperationalStatus.Should().Be(OperationalStatus.NotStarted);
        project.OrganizationId.Should().Be(_orgId);
        project.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ProjectCreatedEvent>();
    }

    [Fact]
    public void Create_ShouldThrow_WhenEndDateBeforeStartDate()
    {
        var start = DateTimeOffset.UtcNow;
        var act = () => Project.Create("PRJ-001", "Test", start, start.AddDays(-1), 0, _currencyId, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*End date*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenCodeEmpty()
    {
        var act = () => Project.Create("", "Test",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1), 0, _currencyId, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*code*");
    }

    [Fact]
    public void Submit_ShouldTransitionFromDraftToSubmitted()
    {
        var project = CreateDraftProject();
        var userId = Guid.NewGuid();

        project.Submit(userId);

        project.Status.Should().Be(ProjectStatus.Submitted);
        project.SubmittedBy.Should().Be(userId);
        project.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public void Submit_ShouldThrow_WhenAlreadyApproved()
    {
        var project = CreateDraftProject();
        project.Submit(Guid.NewGuid());
        project.Approve(Guid.NewGuid());

        var act = () => project.Submit(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*draft or rejected*");
    }

    [Fact]
    public void Approve_ShouldTransitionFromSubmitted()
    {
        var project = CreateDraftProject();
        var approver = Guid.NewGuid();
        project.Submit(Guid.NewGuid());

        project.Approve(approver);

        project.Status.Should().Be(ProjectStatus.Approved);
        project.ApprovedBy.Should().Be(approver);
        project.ApprovedAt.Should().NotBeNull();
        project.DomainEvents.Should().Contain(e => e is ProjectApprovedEvent);
    }

    [Fact]
    public void Approve_ShouldThrow_WhenNotSubmitted()
    {
        var project = CreateDraftProject();
        var act = () => project.Approve(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*submitted*");
    }

    [Fact]
    public void Reject_ShouldSetReasonAndStatus()
    {
        var project = CreateDraftProject();
        project.Submit(Guid.NewGuid());

        project.Reject("Budget not justified");

        project.Status.Should().Be(ProjectStatus.Rejected);
        project.RejectionReason.Should().Be("Budget not justified");
    }

    [Fact]
    public void Reject_ShouldThrow_WhenReasonEmpty()
    {
        var project = CreateDraftProject();
        project.Submit(Guid.NewGuid());

        var act = () => project.Reject("");
        act.Should().Throw<ArgumentException>().WithMessage("*reason*");
    }

    [Fact]
    public void Update_ShouldThrow_WhenProjectApproved()
    {
        var project = CreateDraftProject();
        project.Submit(Guid.NewGuid());
        project.Approve(Guid.NewGuid());

        var act = () => project.Update("New Name", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(2), 200_000m, null, null, null);
        act.Should().Throw<InvalidOperationException>().WithMessage("*amendment*");
    }

    [Fact]
    public void Close_ShouldSetOperationalStatusCompleted()
    {
        var project = CreateDraftProject();
        project.StartOperations();
        var closer = Guid.NewGuid();

        project.Close(closer, "Project deliverables completed");

        project.OperationalStatus.Should().Be(OperationalStatus.Completed);
        project.DomainEvents.Should().Contain(e => e is ProjectClosedEvent);
    }

    [Fact]
    public void Cancel_ShouldSetOperationalStatusCancelled()
    {
        var project = CreateDraftProject();
        project.StartOperations();

        project.Cancel(Guid.NewGuid(), "Funding withdrawn");

        project.OperationalStatus.Should().Be(OperationalStatus.Cancelled);
    }
}
