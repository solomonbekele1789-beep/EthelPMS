using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Domain.Events;

public sealed record ReportGeneratedEvent(
    Guid ReportId,
    Guid OrganizationId,
    string FileName,
    string ReportFormat) : IDomainEvent;
