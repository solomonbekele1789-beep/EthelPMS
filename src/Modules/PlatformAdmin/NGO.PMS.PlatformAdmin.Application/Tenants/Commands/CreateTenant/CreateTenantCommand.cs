using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.CreateTenant;

public record CreateTenantCommand(
    string Name,
    string Slug,
    string AdminEmail,
    Guid SubscriptionPackageId) : IRequest<Guid>;
