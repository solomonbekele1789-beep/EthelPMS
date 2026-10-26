using FluentValidation;

namespace NGO.PMS.Settings.Application.SystemSettings.Commands.UpdateSystemSetting;

public class UpdateSystemSettingCommandValidator : AbstractValidator<UpdateSystemSettingCommand>
{
    public UpdateSystemSettingCommandValidator()
    {
        RuleFor(x => x.SettingKey).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SettingValue).NotNull();
    }
}
