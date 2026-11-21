namespace NGO.PMS.Contracts.IntegrationEvents.PlatformAdmin;

public sealed record TenantSuspendedIntegrationEvent(
    Guid TenantId,
    string Reason) : IntegrationEvent;
