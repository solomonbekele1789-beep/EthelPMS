using FluentValidation;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateSubscription;

public class UpdateSubscriptionCommandValidator : AbstractValidator<UpdateSubscriptionCommand>
{
    public UpdateSubscriptionCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SubscriptionPackageId).NotEmpty();
    }
}
