using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Planning.Application.Plans.Commands.CreatePlanEntry;
using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Tests.Helpers;

namespace NGO.PMS.Planning.Tests.Application;

public class CreatePlanEntryTests
{
    [Fact]
    public async Task Handler_ShouldCreateAnnualPlan()
    {
        var orgId = Guid.NewGuid();
        using var db = PlanningTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = PlanningTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreatePlanEntryCommandHandler(db, currentUser);
        var command = new CreatePlanEntryCommand(
            Level: PlanLevel.Annual,
            ProjectId: Guid.NewGuid(),
            ParentId: null,
            Title: "FY 2027 Annual Plan",
            Description: "Annual operational plan",
            PlannedStartDate: DateTimeOffset.UtcNow,
            PlannedEndDate: DateTimeOffset.UtcNow.AddYears(1),
            PlannedBudget: 500_000m,
            FiscalYear: 2027,
            Quarter: null,
            Month: null,
            WeekNumber: null,
            DayDate: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.PlanEntries.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Level.Should().Be(PlanLevel.Annual);
        saved.Title.Should().Be("FY 2027 Annual Plan");
        saved.ApprovalStatus.Should().Be(ApprovalStatus.Draft);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validator_ShouldFail_WhenTitleEmpty()
    {
        var validator = new CreatePlanEntryCommandValidator();
        var command = new CreatePlanEntryCommand(
            PlanLevel.Annual, Guid.NewGuid(), null, "", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1), 0,
            null, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validator_ShouldFail_WhenEndDateBeforeStartDate()
    {
        var validator = new CreatePlanEntryCommandValidator();
        var start = DateTimeOffset.UtcNow;
        var command = new CreatePlanEntryCommand(
            PlanLevel.Annual, Guid.NewGuid(), null, "Test", null,
            start, start.AddDays(-1), 0,
            null, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PlannedEndDate);
    }
}
