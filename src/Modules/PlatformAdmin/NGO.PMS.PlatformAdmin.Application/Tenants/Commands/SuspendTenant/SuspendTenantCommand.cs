using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.SuspendTenant;

public record SuspendTenantCommand(Guid TenantId, string Reason) : IRequest;
