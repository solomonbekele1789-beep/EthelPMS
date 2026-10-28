using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Planning.Application.Dip.Commands.CreateDipItem;
using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Tests.Helpers;

namespace NGO.PMS.Planning.Tests.Application;

public class CreateDipItemTests
{
    [Fact]
    public async Task Handler_ShouldCreateDipItem()
    {
        var orgId = Guid.NewGuid();
        using var db = PlanningTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = PlanningTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateDipItemCommandHandler(db, currentUser);
        var command = new CreateDipItemCommand(
            ActivityId: Guid.NewGuid(),
            ProjectId: Guid.NewGuid(),
            Title: "Procure field supplies",
            Description: "Purchase kits for distribution",
            PlannedStartDate: DateTimeOffset.UtcNow,
            PlannedEndDate: DateTimeOffset.UtcNow.AddMonths(1),
            BudgetAllocated: 5_000m,
            ResponsibleUserId: Guid.NewGuid(),
            SortOrder: 1);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.DipItems.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Procure field supplies");
        saved.Status.Should().Be(DipStatus.NotStarted);
        saved.BudgetAllocated.Should().Be(5_000m);
    }

    [Fact]
    public void Validator_ShouldFail_WhenTitleEmpty()
    {
        var validator = new CreateDipItemCommandValidator();
        var command = new CreateDipItemCommand(
            Guid.NewGuid(), Guid.NewGuid(), "", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), 0, null, 0);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }
}
