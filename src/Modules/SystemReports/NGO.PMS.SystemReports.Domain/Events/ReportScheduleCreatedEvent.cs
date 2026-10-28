using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Domain.Events;

public sealed record ReportScheduleCreatedEvent(
    Guid ScheduleId,
    Guid OrganizationId,
    string Name) : IDomainEvent;
