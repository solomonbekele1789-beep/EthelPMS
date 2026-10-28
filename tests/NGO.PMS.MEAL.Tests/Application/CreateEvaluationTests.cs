using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.MEAL.Application.Evaluations.Commands.CreateEvaluation;
using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Tests.Helpers;

namespace NGO.PMS.MEAL.Tests.Application;

public class CreateEvaluationTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesEvaluationAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = MealTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = MealTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateEvaluationCommandHandler(db, currentUser);
        var command = new CreateEvaluationCommand(
            Title: "Mid-term Evaluation",
            ProjectId: Guid.NewGuid(),
            EvaluationType: EvaluationType.Evaluation,
            PlannedStartDate: DateTimeOffset.UtcNow,
            PlannedEndDate: DateTimeOffset.UtcNow.AddMonths(3),
            PrimaryDacCriteria: DacCriteria.Effectiveness,
            Budget: 25_000m,
            Description: "Mid-term project evaluation");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Evaluations.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Mid-term Evaluation");
        saved.EvaluationType.Should().Be(EvaluationType.Evaluation);
        saved.Status.Should().Be(EvaluationStatus.Planned);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyTitle_HasError()
    {
        var validator = new CreateEvaluationCommandValidator();
        var command = new CreateEvaluationCommand(
            "", Guid.NewGuid(), EvaluationType.Evaluation,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1),
            null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validate_EndBeforeStart_HasError()
    {
        var validator = new CreateEvaluationCommandValidator();
        var start = DateTimeOffset.UtcNow;
        var command = new CreateEvaluationCommand(
            "Test", Guid.NewGuid(), EvaluationType.Evaluation,
            start, start.AddDays(-1),
            null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PlannedEndDate);
    }
}
