using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SystemReports.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Domain.Entities;

public class ReportSchedule : AuditableEntity
{
    public Guid ReportTemplateId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string CronExpression { get; private set; } = string.Empty;
    public string Recipients { get; private set; } = string.Empty;
    public string? Parameters { get; private set; }
    public DateTimeOffset? LastRunAt { get; private set; }
    public DateTimeOffset? NextRunAt { get; private set; }
    public ScheduleStatus Status { get; private set; } = ScheduleStatus.Active;
    public bool IsActive { get; private set; } = true;

    public Guid OrganizationId { get; set; }

    // Navigation
    public ReportTemplate? ReportTemplate { get; private set; }

    public static ReportSchedule Create(
        Guid reportTemplateId, string name, string cronExpression, string recipients,
        Guid orgId, string? parameters = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Schedule name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(cronExpression))
            throw new ArgumentException("Cron expression is required.", nameof(cronExpression));
        if (string.IsNullOrWhiteSpace(recipients))
            throw new ArgumentException("Recipients are required.", nameof(recipients));

        var schedule = new ReportSchedule
        {
            ReportTemplateId = reportTemplateId,
            Name = name.Trim(),
            CronExpression = cronExpression.Trim(),
            Recipients = recipients,
            Parameters = parameters,
            OrganizationId = orgId
        };
        schedule.AddDomainEvent(new ReportScheduleCreatedEvent(schedule.Id, orgId, name));
        return schedule;
    }

    public void Update(string name, string cronExpression, string recipients,
        string? parameters, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Schedule name is required.", nameof(name));
        Name = name.Trim();
        CronExpression = cronExpression.Trim();
        Recipients = recipients;
        Parameters = parameters;
        IsActive = isActive;
        Status = isActive ? ScheduleStatus.Active : ScheduleStatus.Paused;
    }

    public void ComputeNextRun()
    {
        // Placeholder — in production, parse CronExpression and compute next run time
        NextRunAt = DateTimeOffset.UtcNow.AddHours(1);
    }

    public void MarkRun(bool success)
    {
        LastRunAt = DateTimeOffset.UtcNow;
        Status = success ? ScheduleStatus.Active : ScheduleStatus.Failed;
        if (success) ComputeNextRun();
    }
}
