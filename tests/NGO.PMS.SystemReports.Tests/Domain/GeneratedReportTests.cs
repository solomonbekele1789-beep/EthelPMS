using FluentAssertions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SystemReports.Domain.Events;

namespace NGO.PMS.SystemReports.Tests.Domain;

public class GeneratedReportTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _templateId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Should_Create_GeneratedReport_With_Event()
    {
        var report = GeneratedReport.Create(
            _templateId, _userId, ReportFormat.PDF,
            "donor-report-2024.pdf", 102400, "/reports/donor-report-2024.pdf",
            _orgId);

        report.Should().NotBeNull();
        report.Id.Should().NotBeEmpty();
        report.ReportTemplateId.Should().Be(_templateId);
        report.GeneratedById.Should().Be(_userId);
        report.ReportFormat.Should().Be(ReportFormat.PDF);
        report.FileName.Should().Be("donor-report-2024.pdf");
        report.FileSize.Should().Be(102400);
        report.StoragePath.Should().Be("/reports/donor-report-2024.pdf");
        report.GeneratedAt.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
        report.OrganizationId.Should().Be(_orgId);

        report.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ReportGeneratedEvent>()
            .Which.FileName.Should().Be("donor-report-2024.pdf");
    }

    [Fact]
    public void Should_Track_FileInfo()
    {
        var report = GeneratedReport.Create(
            _templateId, _userId, ReportFormat.Excel,
            "financial-summary.xlsx", 524288, "/reports/financial-summary.xlsx",
            _orgId, expiresAt: DateTimeOffset.UtcNow.AddDays(30));

        report.FileName.Should().Be("financial-summary.xlsx");
        report.FileSize.Should().Be(524288);
        report.StoragePath.Should().Be("/reports/financial-summary.xlsx");
        report.ReportFormat.Should().Be(ReportFormat.Excel);
        report.ExpiresAt.Should().NotBeNull();
        report.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Should_Link_To_Template_And_Schedule()
    {
        var scheduleId = Guid.NewGuid();

        var report = GeneratedReport.Create(
            _templateId, _userId, ReportFormat.CSV,
            "participants.csv", 2048, "/reports/participants.csv",
            _orgId, scheduleId: scheduleId);

        report.ReportTemplateId.Should().Be(_templateId);
        report.ScheduleId.Should().Be(scheduleId);
    }
}
