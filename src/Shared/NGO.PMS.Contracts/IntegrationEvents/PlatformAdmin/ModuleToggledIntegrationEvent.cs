namespace NGO.PMS.Contracts.IntegrationEvents.PlatformAdmin;

public sealed record ModuleToggledIntegrationEvent(
    Guid TenantId,
    string ModuleName,
    bool IsEnabled) : IntegrationEvent;
