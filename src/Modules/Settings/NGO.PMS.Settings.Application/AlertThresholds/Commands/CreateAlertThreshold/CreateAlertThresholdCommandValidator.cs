using FluentValidation;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.CreateAlertThreshold;

public class CreateAlertThresholdCommandValidator : AbstractValidator<CreateAlertThresholdCommand>
{
    public CreateAlertThresholdCommandValidator()
    {
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MetricName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ThresholdValue).NotEmpty();
        RuleFor(x => x.Operator).IsInEnum();
        RuleFor(x => x.AlertSeverity).IsInEnum();
    }
}
