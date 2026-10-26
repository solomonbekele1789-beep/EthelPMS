using MediatR;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Queries.ListAccessKeys;

public record ListAccessKeysQuery(Guid TenantId) : IRequest<List<AccessKeyDto>>;
