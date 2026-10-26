using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Events;

public sealed record GrantActivatedEvent(Guid GrantId, Guid DonorId, decimal TotalAmount) : IDomainEvent;
