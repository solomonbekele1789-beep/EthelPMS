using FluentAssertions;
using NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;
using NGO.PMS.Reporting.Application.Reports.Commands.SubmitReport;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.Reporting.Tests.Helpers;

namespace NGO.PMS.Reporting.Tests.Application;

public class SubmitReportTests
{
    [Fact]
    public async Task Handler_ShouldSubmitDraftReport()
    {
        var orgId = Guid.NewGuid();
        using var db = ReportingTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ReportingTestFixture.CreateMockCurrentUser(orgId: orgId);

        // Create a report first
        var createHandler = new CreateReportCommandHandler(db, currentUser);
        var reportId = await createHandler.Handle(new CreateReportCommand(
            "Test Report", ReportType.Monthly, Guid.NewGuid(),
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1),
            null, null, null, null, null, null, 10_000m), CancellationToken.None);

        // Submit it
        var submitHandler = new SubmitReportCommandHandler(db, currentUser);
        await submitHandler.Handle(new SubmitReportCommand(reportId), CancellationToken.None);

        var report = await db.Reports.FindAsync(reportId);
        report!.Status.Should().Be(ReportStatus.Submitted);
        report.SubmittedBy.Should().Be(currentUser.UserId);
    }

    [Fact]
    public async Task Handler_ShouldThrow_WhenReportNotFound()
    {
        var orgId = Guid.NewGuid();
        using var db = ReportingTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ReportingTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new SubmitReportCommandHandler(db, currentUser);
        var act = () => handler.Handle(
            new SubmitReportCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<Exception>();
    }
}
