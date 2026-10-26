using FluentAssertions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Domain.Events;

namespace NGO.PMS.MEAL.Tests.Domain;

public class MealPlanTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    private MealPlan CreateDraftPlan()
        => MealPlan.Create("Test Plan", _projectId, _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var plan = CreateDraftPlan();

        plan.Title.Should().Be("Test Plan");
        plan.Status.Should().Be(MealPlanStatus.Draft);
        plan.ProjectId.Should().Be(_projectId);
        plan.OrganizationId.Should().Be(_orgId);
        plan.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<MealPlanCreatedEvent>();
    }

    [Fact]
    public void Create_EmptyTitle_ThrowsArgumentException()
    {
        var act = () => MealPlan.Create("", _projectId, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*title*");
    }

    [Fact]
    public void Update_DraftPlan_UpdatesTitle()
    {
        var plan = CreateDraftPlan();

        plan.Update("New Title", null);

        plan.Title.Should().Be("New Title");
    }

    [Fact]
    public void Update_ApprovedPlan_ThrowsInvalidOperationException()
    {
        var plan = CreateDraftPlan();
        plan.Submit(Guid.NewGuid());
        plan.Approve(Guid.NewGuid());

        var act = () => plan.Update("Updated", null);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Approved*");
    }

    [Fact]
    public void UpdateSection_ValidSection_SetsContent()
    {
        var plan = CreateDraftPlan();

        plan.UpdateSection(1, "content");

        plan.ResultsAndIndicators.Should().Be("content");
    }

    [Fact]
    public void UpdateSection_InvalidSection_ThrowsArgumentException()
    {
        var plan = CreateDraftPlan();

        var act = () => plan.UpdateSection(9, "x");
        act.Should().Throw<ArgumentException>().WithMessage("*section*");
    }

    [Fact]
    public void Submit_DraftPlan_ChangesStatusToSubmitted()
    {
        var plan = CreateDraftPlan();
        var userId = Guid.NewGuid();

        plan.Submit(userId);

        plan.Status.Should().Be(MealPlanStatus.Submitted);
        plan.SubmittedBy.Should().Be(userId);
        plan.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public void Submit_ApprovedPlan_ThrowsInvalidOperationException()
    {
        var plan = CreateDraftPlan();
        plan.Submit(Guid.NewGuid());
        plan.Approve(Guid.NewGuid());

        var act = () => plan.Submit(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Approve_SubmittedPlan_ChangesStatusToApproved()
    {
        var plan = CreateDraftPlan();
        var approver = Guid.NewGuid();
        plan.Submit(Guid.NewGuid());

        plan.Approve(approver);

        plan.Status.Should().Be(MealPlanStatus.Approved);
        plan.ApprovedBy.Should().Be(approver);
        plan.ApprovedAt.Should().NotBeNull();
        plan.DomainEvents.Should().Contain(e => e is MealPlanApprovedEvent);
    }

    [Fact]
    public void Reject_SubmittedPlan_ChangesStatusToRejected()
    {
        var plan = CreateDraftPlan();
        plan.Submit(Guid.NewGuid());

        plan.Reject("Incomplete sections");

        plan.Status.Should().Be(MealPlanStatus.Rejected);
        plan.RejectionReason.Should().Be("Incomplete sections");
    }
}
