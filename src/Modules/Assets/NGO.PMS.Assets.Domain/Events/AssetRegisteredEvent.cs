using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Events;

public sealed record AssetRegisteredEvent(Guid AssetId, string AssetCode, string Name) : IDomainEvent;
