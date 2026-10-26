using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenant;

public record UpdateTenantCommand(
    Guid TenantId,
    string? Name,
    int? MaxUsers,
    int? MaxProjects,
    string? Timezone) : IRequest;
