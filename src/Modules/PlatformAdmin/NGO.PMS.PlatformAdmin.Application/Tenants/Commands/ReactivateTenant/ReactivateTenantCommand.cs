using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ReactivateTenant;

public record ReactivateTenantCommand(Guid TenantId) : IRequest;
