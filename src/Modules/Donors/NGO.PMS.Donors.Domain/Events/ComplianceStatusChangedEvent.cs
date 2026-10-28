using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Events;

public sealed record ComplianceStatusChangedEvent(Guid GrantId, ComplianceStatus OldStatus, ComplianceStatus NewStatus) : IDomainEvent;
