using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Events;

public sealed record ExportJobCreatedEvent(
    Guid JobId,
    Guid OrganizationId,
    string Module,
    string ExportFormat) : IDomainEvent;
