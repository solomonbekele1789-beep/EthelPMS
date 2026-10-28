using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Events;

public sealed record DocumentUploadedEvent(Guid DocumentId, string FileName, int Version) : IDomainEvent;
