using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Events;

public sealed record AssetDisposedEvent(Guid AssetId, Guid DisposalId, decimal DisposalValue) : IDomainEvent;
