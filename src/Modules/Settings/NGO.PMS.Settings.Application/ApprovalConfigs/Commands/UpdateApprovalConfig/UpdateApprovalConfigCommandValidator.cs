using FluentValidation;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.UpdateApprovalConfig;

public class UpdateApprovalConfigCommandValidator : AbstractValidator<UpdateApprovalConfigCommand>
{
    public UpdateApprovalConfigCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.RequiredApprovalLevels).InclusiveBetween(1, 5);
        RuleFor(x => x.AutoApproveBelow).GreaterThan(0).When(x => x.AutoApproveBelow.HasValue);
    }
}
