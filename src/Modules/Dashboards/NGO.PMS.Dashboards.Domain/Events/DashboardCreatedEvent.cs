using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Domain.Events;

public sealed record DashboardCreatedEvent(
    Guid DashboardId,
    Guid OrganizationId,
    string DashboardType) : IDomainEvent;
