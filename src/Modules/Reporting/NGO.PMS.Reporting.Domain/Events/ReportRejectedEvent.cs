using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Events;

public sealed record ReportRejectedEvent(
    Guid ReportId,
    string Reason) : IDomainEvent;
