using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Events;

public sealed record DocumentVersionCreatedEvent(Guid DocumentId, Guid VersionId, int VersionNumber) : IDomainEvent;
