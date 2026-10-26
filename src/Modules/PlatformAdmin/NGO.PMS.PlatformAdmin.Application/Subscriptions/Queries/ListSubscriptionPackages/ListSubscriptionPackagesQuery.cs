using MediatR;
using NGO.PMS.PlatformAdmin.Application.Subscriptions.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Subscriptions.Queries.ListSubscriptionPackages;

public record ListSubscriptionPackagesQuery : IRequest<List<SubscriptionPackageDto>>;
