using FluentValidation;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.CreateApprovalConfig;

public class CreateApprovalConfigCommandValidator : AbstractValidator<CreateApprovalConfigCommand>
{
    public CreateApprovalConfigCommandValidator()
    {
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.RequiredApprovalLevels).InclusiveBetween(1, 5);
        RuleFor(x => x.AutoApproveBelow).GreaterThan(0).When(x => x.AutoApproveBelow.HasValue);
    }
}
