using FluentAssertions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.Reporting.Domain.Events;

namespace NGO.PMS.Reporting.Tests.Domain;

public class ReportTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    private Report CreateDraftReport()
        => Report.Create("Monthly Report March", ReportType.Monthly, _projectId,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), _orgId);

    [Fact]
    public void Create_ShouldSetDraftStatusAndRaiseDomainEvent()
    {
        var report = CreateDraftReport();

        report.Title.Should().Be("Monthly Report March");
        report.ReportType.Should().Be(ReportType.Monthly);
        report.Status.Should().Be(ReportStatus.Draft);
        report.ProjectId.Should().Be(_projectId);
        report.OrganizationId.Should().Be(_orgId);
        report.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ReportCreatedEvent>();
    }

    [Fact]
    public void Create_ShouldThrow_WhenTitleEmpty()
    {
        var act = () => Report.Create("", ReportType.Monthly, _projectId,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(1), _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*title*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenPeriodEndBeforeStart()
    {
        var start = DateTimeOffset.UtcNow;
        var act = () => Report.Create("Test", ReportType.Monthly, _projectId,
            start, start.AddDays(-1), _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*period*");
    }

    [Fact]
    public void Submit_ShouldTransitionToSubmitted()
    {
        var report = CreateDraftReport();
        var userId = Guid.NewGuid();

        report.Submit(userId);

        report.Status.Should().Be(ReportStatus.Submitted);
        report.SubmittedBy.Should().Be(userId);
        report.SubmittedAt.Should().NotBeNull();
        report.DomainEvents.Should().Contain(e => e is ReportSubmittedEvent);
    }

    [Fact]
    public void Submit_ShouldThrow_WhenAlreadyApproved()
    {
        var report = CreateDraftReport();
        report.Submit(Guid.NewGuid());
        report.Approve(Guid.NewGuid(), 1);

        var act = () => report.Submit(Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Approve_SingleLevel_ShouldSetApproved()
    {
        var report = CreateDraftReport();
        var approver = Guid.NewGuid();
        report.Submit(Guid.NewGuid());

        report.Approve(approver, 1);

        report.Status.Should().Be(ReportStatus.Approved);
        report.FinalApprovedBy.Should().Be(approver);
        report.FinalApprovedAt.Should().NotBeNull();
        report.CurrentApprovalLevel.Should().Be(1);
        report.DomainEvents.Should().Contain(e => e is ReportApprovedEvent);
    }

    [Fact]
    public void Approve_MultiLevel_ShouldRemainUnderReview_UntilFinalLevel()
    {
        var report = Report.Create("Quarterly", ReportType.Quarterly, _projectId,
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddMonths(3), _orgId,
            requiredApprovalLevels: 3);
        report.Submit(Guid.NewGuid());

        report.Approve(Guid.NewGuid(), 1);
        report.Status.Should().Be(ReportStatus.UnderReview);
        report.CurrentApprovalLevel.Should().Be(1);

        report.Approve(Guid.NewGuid(), 2);
        report.Status.Should().Be(ReportStatus.UnderReview);

        report.Approve(Guid.NewGuid(), 3);
        report.Status.Should().Be(ReportStatus.Approved);
    }

    [Fact]
    public void Approve_ShouldThrow_WhenDraft()
    {
        var report = CreateDraftReport();
        var act = () => report.Approve(Guid.NewGuid(), 1);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Reject_ShouldSetRejectedWithReason()
    {
        var report = CreateDraftReport();
        report.Submit(Guid.NewGuid());

        report.Reject(Guid.NewGuid(), 1, "Incomplete financial data");

        report.Status.Should().Be(ReportStatus.Rejected);
        report.RejectionReason.Should().Be("Incomplete financial data");
        report.DomainEvents.Should().Contain(e => e is ReportRejectedEvent);
    }

    [Fact]
    public void Reject_ShouldThrow_WhenNoReason()
    {
        var report = CreateDraftReport();
        report.Submit(Guid.NewGuid());

        var act = () => report.Reject(Guid.NewGuid(), 1, "");
        act.Should().Throw<ArgumentException>().WithMessage("*reason*");
    }

    [Fact]
    public void Update_ShouldThrow_WhenNotDraft()
    {
        var report = CreateDraftReport();
        report.Submit(Guid.NewGuid());

        var act = () => report.Update("New", null, null, null, null, 0, 0, null, Guid.NewGuid());
        act.Should().Throw<InvalidOperationException>().WithMessage("*Draft*");
    }

    [Fact]
    public void Variance_ShouldCalculateCorrectly()
    {
        var report = CreateDraftReport();
        report.UpdateFinancials(100_000m, 75_000m, null);

        report.Variance.Should().Be(25_000m);
        report.BudgetUtilizationRate.Should().Be(75m);
    }

    [Fact]
    public void UpdateIncidentDetails_ShouldThrow_ForNonIncidentReport()
    {
        var report = CreateDraftReport(); // Monthly, not Incident
        var act = () => report.UpdateIncidentDetails(
            DateTimeOffset.UtcNow, "Office", "Fire", null, null, null);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Incident*");
    }

    [Fact]
    public void SetPeriodDesignators_ShouldSetAllValues()
    {
        var report = CreateDraftReport();
        report.SetPeriodDesignators(2027, 1, 3, null);

        report.FiscalYear.Should().Be(2027);
        report.Quarter.Should().Be(1);
        report.Month.Should().Be(3);
        report.WeekNumber.Should().BeNull();
    }
}
