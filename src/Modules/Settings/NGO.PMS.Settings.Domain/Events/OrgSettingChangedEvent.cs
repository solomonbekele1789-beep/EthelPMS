using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Domain.Events;

public sealed record OrgSettingChangedEvent(
    Guid OrgSettingId,
    Guid OrganizationId,
    string SettingKey) : IDomainEvent;
