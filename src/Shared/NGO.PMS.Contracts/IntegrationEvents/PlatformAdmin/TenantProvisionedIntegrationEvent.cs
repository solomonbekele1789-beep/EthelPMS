namespace NGO.PMS.Contracts.IntegrationEvents.PlatformAdmin;

public sealed record TenantProvisionedIntegrationEvent(
    Guid TenantId,
    string Slug,
    string Name,
    string AdminEmail) : IntegrationEvent;
