using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Events;

public sealed record ImportJobCompletedEvent(
    Guid JobId,
    Guid OrganizationId,
    int SuccessRows,
    int ErrorRows) : IDomainEvent;
