using FluentValidation;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.UpdateAlertThreshold;

public class UpdateAlertThresholdCommandValidator : AbstractValidator<UpdateAlertThresholdCommand>
{
    public UpdateAlertThresholdCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ThresholdValue).NotEmpty();
        RuleFor(x => x.Operator).IsInEnum();
        RuleFor(x => x.AlertSeverity).IsInEnum();
    }
}
