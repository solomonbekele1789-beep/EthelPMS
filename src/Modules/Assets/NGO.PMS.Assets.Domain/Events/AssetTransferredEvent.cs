using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Events;

public sealed record AssetTransferredEvent(Guid AssetId, Guid TransferId, string FromLocation, string ToLocation) : IDomainEvent;
