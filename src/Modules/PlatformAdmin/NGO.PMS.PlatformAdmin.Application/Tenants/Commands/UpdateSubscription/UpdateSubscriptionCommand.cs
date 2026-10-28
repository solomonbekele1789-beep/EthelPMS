using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateSubscription;

public record UpdateSubscriptionCommand(
    Guid TenantId,
    Guid SubscriptionPackageId) : IRequest;
