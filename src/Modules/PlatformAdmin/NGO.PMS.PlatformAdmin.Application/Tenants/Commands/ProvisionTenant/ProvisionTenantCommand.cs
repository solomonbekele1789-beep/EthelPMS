using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ProvisionTenant;

public record ProvisionTenantCommand(Guid TenantId) : IRequest;
