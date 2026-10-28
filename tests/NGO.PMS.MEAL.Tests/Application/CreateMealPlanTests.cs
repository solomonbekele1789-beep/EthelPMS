using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.MEAL.Application.MealPlans.Commands.CreateMealPlan;
using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Tests.Helpers;

namespace NGO.PMS.MEAL.Tests.Application;

public class CreateMealPlanTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesPlanAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = MealTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = MealTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateMealPlanCommandHandler(db, currentUser);
        var command = new CreateMealPlanCommand(
            Title: "Annual MEAL Plan 2027",
            ProjectId: Guid.NewGuid(),
            Description: "Comprehensive MEAL framework");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.MealPlans.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Annual MEAL Plan 2027");
        saved.Status.Should().Be(MealPlanStatus.Draft);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyTitle_HasError()
    {
        var validator = new CreateMealPlanCommandValidator();
        var command = new CreateMealPlanCommand("", Guid.NewGuid(), null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validate_ValidCommand_NoErrors()
    {
        var validator = new CreateMealPlanCommandValidator();
        var command = new CreateMealPlanCommand("Valid Plan", Guid.NewGuid(), null);

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyProjectId_HasError()
    {
        var validator = new CreateMealPlanCommandValidator();
        var command = new CreateMealPlanCommand("Test Plan", Guid.Empty, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ProjectId);
    }
}
