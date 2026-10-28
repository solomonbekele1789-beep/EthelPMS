using FluentAssertions;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Domain.Events;

namespace NGO.PMS.Planning.Tests.Domain;

public class PlanEntryTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    private PlanEntry CreateAnnualPlan()
        => PlanEntry.Create(PlanLevel.Annual, "FY 2027 Annual Plan", _projectId, _orgId,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1), 500_000m);

    [Fact]
    public void Create_ShouldSetDraftApprovalStatus()
    {
        var plan = CreateAnnualPlan();

        plan.Level.Should().Be(PlanLevel.Annual);
        plan.Title.Should().Be("FY 2027 Annual Plan");
        plan.ApprovalStatus.Should().Be(ApprovalStatus.Draft);
        plan.Status.Should().Be(PlanStatus.NotStarted);
        plan.ProjectId.Should().Be(_projectId);
        plan.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<PlanCreatedEvent>();
    }

    [Fact]
    public void Create_ShouldThrow_WhenTitleEmpty()
    {
        var act = () => PlanEntry.Create(PlanLevel.Annual, "", _projectId, _orgId,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1), 0);
        act.Should().Throw<ArgumentException>().WithMessage("*title*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenEndDateBeforeStartDate()
    {
        var start = DateTimeOffset.UtcNow;
        var act = () => PlanEntry.Create(PlanLevel.Annual, "Test", _projectId, _orgId,
            start, start.AddDays(-1), 0);
        act.Should().Throw<ArgumentException>().WithMessage("*End date*");
    }

    [Fact]
    public void Submit_ShouldTransitionToSubmitted()
    {
        var plan = CreateAnnualPlan();
        var userId = Guid.NewGuid();

        plan.Submit(userId);

        plan.ApprovalStatus.Should().Be(ApprovalStatus.Submitted);
        plan.SubmittedBy.Should().Be(userId);
    }

    [Fact]
    public void Approve_ShouldTransitionFromSubmitted()
    {
        var plan = CreateAnnualPlan();
        var approver = Guid.NewGuid();
        plan.Submit(Guid.NewGuid());

        plan.Approve(approver);

        plan.ApprovalStatus.Should().Be(ApprovalStatus.Approved);
        plan.ApprovedBy.Should().Be(approver);
        plan.DomainEvents.Should().Contain(e => e is PlanApprovedEvent);
    }

    [Fact]
    public void Approve_ShouldThrow_WhenNotSubmitted()
    {
        var plan = CreateAnnualPlan();
        var act = () => plan.Approve(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*submitted*");
    }

    [Fact]
    public void Reject_ShouldSetReasonAndStatus()
    {
        var plan = CreateAnnualPlan();
        plan.Submit(Guid.NewGuid());

        plan.Reject("Budget too high");

        plan.ApprovalStatus.Should().Be(ApprovalStatus.Rejected);
        plan.RejectionReason.Should().Be("Budget too high");
    }

    [Fact]
    public void Update_ShouldThrow_WhenApproved()
    {
        var plan = CreateAnnualPlan();
        plan.Submit(Guid.NewGuid());
        plan.Approve(Guid.NewGuid());

        var act = () => plan.Update("New Title", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1), 100_000m);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Approved*");
    }

    [Fact]
    public void ValidateChildAddition_ShouldThrow_WhenWrongLevel()
    {
        var plan = CreateAnnualPlan();
        var act = () => plan.ValidateChildAddition(PlanLevel.Monthly, 0);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Quarterly*");
    }

    [Fact]
    public void ValidateChildAddition_ShouldThrow_WhenMaxChildrenReached()
    {
        var plan = CreateAnnualPlan();
        var act = () => plan.ValidateChildAddition(PlanLevel.Quarterly, 4);
        act.Should().Throw<InvalidOperationException>().WithMessage("*at most 4*");
    }

    [Fact]
    public void ValidateChildDates_ShouldThrow_WhenOutOfRange()
    {
        var plan = CreateAnnualPlan();
        var act = () => plan.ValidateChildDates(
            plan.PlannedStartDate.AddDays(-1), plan.PlannedEndDate);
        act.Should().Throw<InvalidOperationException>().WithMessage("*within parent*");
    }

    [Fact]
    public void ValidateChildBudget_ShouldThrow_WhenExceedsParent()
    {
        var plan = CreateAnnualPlan(); // 500k budget
        var act = () => plan.ValidateChildBudget(300_000m, 300_000m);
        act.Should().Throw<InvalidOperationException>().WithMessage("*exceed parent*");
    }

    [Fact]
    public void UpdateProgress_ShouldUpdateStatusAndPercentage()
    {
        var plan = CreateAnnualPlan();
        plan.UpdateProgress(PlanStatus.InProgress, 45);

        plan.Status.Should().Be(PlanStatus.InProgress);
        plan.ProgressPercentage.Should().Be(45);
    }

    [Fact]
    public void UpdateProgress_ShouldThrow_WhenPercentageInvalid()
    {
        var plan = CreateAnnualPlan();
        var act = () => plan.UpdateProgress(PlanStatus.InProgress, 110);
        act.Should().Throw<ArgumentException>().WithMessage("*0-100*");
    }
}
