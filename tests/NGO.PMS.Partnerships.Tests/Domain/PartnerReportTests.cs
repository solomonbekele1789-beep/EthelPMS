using FluentAssertions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Tests.Domain;

public class PartnerReportTests
{
    private static PartnerReport CreateValidReport()
    {
        return PartnerReport.Create(
            organizationId: Guid.NewGuid(),
            subGranteeId: Guid.NewGuid(),
            reportType: PartnerReportType.Quarterly,
            reportingPeriodStart: new DateTime(2024, 1, 1),
            reportingPeriodEnd: new DateTime(2024, 3, 31),
            title: "Q1 2024 Quarterly Report");
    }

    [Fact]
    public void Should_Create_PartnerReport()
    {
        var report = CreateValidReport();

        report.Should().NotBeNull();
        report.Id.Should().NotBeEmpty();
        report.Title.Should().Be("Q1 2024 Quarterly Report");
        report.ReportType.Should().Be(PartnerReportType.Quarterly);
        report.Status.Should().Be(ReportStatus.Draft);
        report.SubmittedAt.Should().BeNull();
        report.ReviewedById.Should().BeNull();
        report.ReviewedAt.Should().BeNull();
    }

    [Fact]
    public void Should_Submit_Report()
    {
        var report = CreateValidReport();

        report.Submit(
            narrative: "Activities completed during Q1 2024.",
            financialSummaryJson: "{\"total_spent\": 25000}");

        report.Status.Should().Be(ReportStatus.Submitted);
        report.SubmittedAt.Should().NotBeNull();
        report.Narrative.Should().Be("Activities completed during Q1 2024.");
        report.FinancialSummaryJson.Should().Contain("total_spent");
    }

    [Fact]
    public void Should_Review_Report()
    {
        var report = CreateValidReport();
        report.Submit("Narrative text", null);

        var reviewerId = Guid.NewGuid();
        report.Review(reviewerId, ReportStatus.Approved, "Looks good. Approved.");

        report.Status.Should().Be(ReportStatus.Approved);
        report.ReviewedById.Should().Be(reviewerId);
        report.ReviewedAt.Should().NotBeNull();
        report.ReviewComments.Should().Be("Looks good. Approved.");
    }
}
