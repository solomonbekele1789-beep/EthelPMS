using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ActivateTenant;

public record ActivateTenantCommand(Guid TenantId) : IRequest;
