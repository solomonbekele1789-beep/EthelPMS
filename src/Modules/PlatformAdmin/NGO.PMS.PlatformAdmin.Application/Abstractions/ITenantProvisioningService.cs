namespace NGO.PMS.PlatformAdmin.Application.Abstractions;

public interface ITenantProvisioningService
{
    Task ProvisionAsync(Guid tenantId, CancellationToken ct = default);
}
