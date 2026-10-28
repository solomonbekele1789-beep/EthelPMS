using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Events;

public sealed record ReportApprovedEvent(
    Guid ReportId,
    Guid ApprovedByUserId) : IDomainEvent;
