using MediatR;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetProvisioningStatus;

public record GetProvisioningStatusQuery(Guid TenantId) : IRequest<List<ProvisioningLogDto>>;
