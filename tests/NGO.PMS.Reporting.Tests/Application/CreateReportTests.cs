using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.Reporting.Tests.Helpers;

namespace NGO.PMS.Reporting.Tests.Application;

public class CreateReportTests
{
    [Fact]
    public async Task Handler_ShouldCreateReport()
    {
        var orgId = Guid.NewGuid();
        using var db = ReportingTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ReportingTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateReportCommandHandler(db, currentUser);
        var command = new CreateReportCommand(
            Title: "March Monthly Report",
            ReportType: ReportType.Monthly,
            ProjectId: Guid.NewGuid(),
            PeriodStart: DateTimeOffset.UtcNow,
            PeriodEnd: DateTimeOffset.UtcNow.AddMonths(1),
            ReportTemplateId: null,
            ActivityId: null,
            FiscalYear: 2027,
            Quarter: null,
            Month: 3,
            WeekNumber: null,
            PlannedBudget: 50_000m);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Reports.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("March Monthly Report");
        saved.ReportType.Should().Be(ReportType.Monthly);
        saved.Status.Should().Be(ReportStatus.Draft);
        saved.OrganizationId.Should().Be(orgId);
        saved.FiscalYear.Should().Be(2027);
        saved.Month.Should().Be(3);
    }

    [Fact]
    public void Validator_ShouldFail_WhenTitleEmpty()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            "", ReportType.Monthly, Guid.NewGuid(),
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1),
            null, null, null, null, null, null, 0);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validator_ShouldFail_WhenEndDateBeforeStart()
    {
        var validator = new CreateReportCommandValidator();
        var start = DateTimeOffset.UtcNow;
        var command = new CreateReportCommand(
            "Test", ReportType.Monthly, Guid.NewGuid(),
            start, start.AddDays(-1),
            null, null, null, null, null, null, 0);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PeriodEnd);
    }

    [Fact]
    public void Validator_ShouldFail_WhenProjectIdEmpty()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            "Test", ReportType.Monthly, Guid.Empty,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1),
            null, null, null, null, null, null, 0);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ProjectId);
    }
}
