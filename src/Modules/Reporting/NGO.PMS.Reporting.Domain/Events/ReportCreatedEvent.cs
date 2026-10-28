using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Events;

public sealed record ReportCreatedEvent(
    Guid ReportId,
    ReportType ReportType,
    Guid ProjectId) : IDomainEvent;
