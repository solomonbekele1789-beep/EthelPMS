using FluentAssertions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SystemReports.Domain.Events;

namespace NGO.PMS.SystemReports.Tests.Domain;

public class ReportScheduleTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _templateId = Guid.NewGuid();

    [Fact]
    public void Should_Create_Schedule_With_Event()
    {
        var schedule = ReportSchedule.Create(
            _templateId, "Daily Donor Report", "0 8 * * *",
            "admin@ngo.org", _orgId, parameters: "{\"format\":\"pdf\"}");

        schedule.Should().NotBeNull();
        schedule.Id.Should().NotBeEmpty();
        schedule.ReportTemplateId.Should().Be(_templateId);
        schedule.Name.Should().Be("Daily Donor Report");
        schedule.CronExpression.Should().Be("0 8 * * *");
        schedule.Recipients.Should().Be("admin@ngo.org");
        schedule.Parameters.Should().Be("{\"format\":\"pdf\"}");
        schedule.Status.Should().Be(ScheduleStatus.Active);
        schedule.IsActive.Should().BeTrue();
        schedule.OrganizationId.Should().Be(_orgId);

        schedule.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ReportScheduleCreatedEvent>()
            .Which.Name.Should().Be("Daily Donor Report");
    }

    [Fact]
    public void Should_Update_Schedule()
    {
        var schedule = ReportSchedule.Create(
            _templateId, "Old Name", "0 0 * * *",
            "old@test.com", _orgId);
        schedule.ClearDomainEvents();

        schedule.Update("New Name", "0 12 * * *", "new@test.com",
            "{\"key\":\"value\"}", isActive: false);

        schedule.Name.Should().Be("New Name");
        schedule.CronExpression.Should().Be("0 12 * * *");
        schedule.Recipients.Should().Be("new@test.com");
        schedule.Parameters.Should().Be("{\"key\":\"value\"}");
        schedule.IsActive.Should().BeFalse();
        schedule.Status.Should().Be(ScheduleStatus.Paused);
    }

    [Fact]
    public void Should_Compute_Next_Run()
    {
        var schedule = ReportSchedule.Create(
            _templateId, "Test Schedule", "0 0 * * *",
            "user@test.com", _orgId);

        schedule.NextRunAt.Should().BeNull();

        schedule.ComputeNextRun();

        schedule.NextRunAt.Should().NotBeNull();
        schedule.NextRunAt.Should().BeAfter(DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Should_Mark_Successful_Run()
    {
        var schedule = ReportSchedule.Create(
            _templateId, "Scheduled Report", "0 6 * * 1",
            "manager@ngo.org", _orgId);

        schedule.MarkRun(success: true);

        schedule.LastRunAt.Should().NotBeNull();
        schedule.LastRunAt.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
        schedule.Status.Should().Be(ScheduleStatus.Active);
        schedule.NextRunAt.Should().NotBeNull(); // ComputeNextRun called on success
    }
}
