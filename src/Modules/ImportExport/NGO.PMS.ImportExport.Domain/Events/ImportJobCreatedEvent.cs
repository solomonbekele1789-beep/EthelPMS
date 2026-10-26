using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Events;

public sealed record ImportJobCreatedEvent(
    Guid JobId,
    Guid OrganizationId,
    string Module,
    string EntityType) : IDomainEvent;
