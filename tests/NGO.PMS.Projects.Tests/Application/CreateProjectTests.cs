using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Projects.Application.Projects.Commands.CreateProject;
using NGO.PMS.Projects.Domain.Enums;
using NGO.PMS.Projects.Tests.Helpers;

namespace NGO.PMS.Projects.Tests.Application;

public class CreateProjectTests
{
    [Fact]
    public async Task Handler_ShouldCreateProject_WithUppercaseCode()
    {
        var orgId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateProjectCommandHandler(db, currentUser);
        var command = new CreateProjectCommand(
            Code: "prj-test",
            Name: "Test Project",
            Description: "A test project",
            StartDate: DateTimeOffset.UtcNow,
            EndDate: DateTimeOffset.UtcNow.AddYears(1),
            TotalBudget: 100_000m,
            CurrencyId: Guid.NewGuid(),
            DonorName: "USAID",
            Sector: "Health",
            ProgramPillar: null,
            OfficeId: null,
            ProjectManagerId: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Projects.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Code.Should().Be("PRJ-TEST");
        saved.Status.Should().Be(ProjectStatus.Draft);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public async Task Handler_ShouldThrow_WhenDuplicateCode()
    {
        var orgId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateProjectCommandHandler(db, currentUser);
        var command = new CreateProjectCommand(
            "DUP-001", "Project 1", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            50_000m, Guid.NewGuid(), null, null, null, null, null);

        await handler.Handle(command, CancellationToken.None);

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<Exception>().WithMessage("*already exists*");
    }

    [Fact]
    public void Validator_ShouldFail_WhenCodeEmpty()
    {
        var validator = new CreateProjectCommandValidator();
        var command = new CreateProjectCommand(
            "", "Name", null,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            0, Guid.NewGuid(), null, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Validator_ShouldFail_WhenEndDateBeforeStartDate()
    {
        var validator = new CreateProjectCommandValidator();
        var start = DateTimeOffset.UtcNow;
        var command = new CreateProjectCommand(
            "PRJ-001", "Name", null,
            start, start.AddDays(-1),
            0, Guid.NewGuid(), null, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.EndDate);
    }
}
