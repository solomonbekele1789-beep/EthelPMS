using FluentAssertions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Domain.Events;

namespace NGO.PMS.MEAL.Tests.Domain;

public class EvaluationTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    private Evaluation CreatePlannedEvaluation()
        => Evaluation.Create("Mid-term Evaluation", _projectId, EvaluationType.Evaluation,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(3), _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var evaluation = CreatePlannedEvaluation();

        evaluation.Title.Should().Be("Mid-term Evaluation");
        evaluation.EvaluationType.Should().Be(EvaluationType.Evaluation);
        evaluation.Status.Should().Be(EvaluationStatus.Planned);
        evaluation.ProjectId.Should().Be(_projectId);
        evaluation.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Create_EndBeforeStart_ThrowsArgumentException()
    {
        var start = DateTimeOffset.UtcNow;
        var act = () => Evaluation.Create("Test", _projectId, EvaluationType.Evaluation,
            start, start.AddDays(-1), _orgId);

        act.Should().Throw<ArgumentException>().WithMessage("*date*");
    }

    [Fact]
    public void StartEvaluation_PlannedStatus_ChangesStatus()
    {
        var evaluation = CreatePlannedEvaluation();

        evaluation.StartEvaluation(DateTimeOffset.UtcNow);

        evaluation.Status.Should().Be(EvaluationStatus.InProgress);
        evaluation.ActualStartDate.Should().NotBeNull();
    }

    [Fact]
    public void Complete_InProgressStatus_SetsCompleted()
    {
        var evaluation = CreatePlannedEvaluation();
        evaluation.StartEvaluation(DateTimeOffset.UtcNow);

        evaluation.Complete(DateTimeOffset.UtcNow);

        evaluation.Status.Should().Be(EvaluationStatus.Completed);
        evaluation.ActualEndDate.Should().NotBeNull();
        evaluation.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<EvaluationCompletedEvent>();
    }

    [Fact]
    public void Complete_PlannedStatus_ThrowsInvalidOperationException()
    {
        var evaluation = CreatePlannedEvaluation();

        var act = () => evaluation.Complete(DateTimeOffset.UtcNow);
        act.Should().Throw<InvalidOperationException>().WithMessage("*InProgress*");
    }

    [Fact]
    public void Cancel_PlannedStatus_ChangesCancelled()
    {
        var evaluation = CreatePlannedEvaluation();

        evaluation.Cancel();

        evaluation.Status.Should().Be(EvaluationStatus.Cancelled);
    }

    [Fact]
    public void Cancel_CompletedStatus_ThrowsInvalidOperationException()
    {
        var evaluation = CreatePlannedEvaluation();
        evaluation.StartEvaluation(DateTimeOffset.UtcNow);
        evaluation.Complete(DateTimeOffset.UtcNow);

        var act = () => evaluation.Cancel();
        act.Should().Throw<InvalidOperationException>().WithMessage("*Completed*");
    }
}
