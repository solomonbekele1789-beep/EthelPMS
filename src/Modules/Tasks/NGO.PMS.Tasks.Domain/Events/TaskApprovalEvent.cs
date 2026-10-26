using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Domain.Events;

public sealed record TaskApprovalEvent(Guid TaskId, Guid ApproverId, ApprovalAction Action) : IDomainEvent;
