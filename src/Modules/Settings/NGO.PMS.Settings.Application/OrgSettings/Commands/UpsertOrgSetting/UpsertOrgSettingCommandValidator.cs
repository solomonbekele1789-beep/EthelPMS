using FluentValidation;

namespace NGO.PMS.Settings.Application.OrgSettings.Commands.UpsertOrgSetting;

public class UpsertOrgSettingCommandValidator : AbstractValidator<UpsertOrgSettingCommand>
{
    public UpsertOrgSettingCommandValidator()
    {
        RuleFor(x => x.SettingKey).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SettingValue).NotNull();
        RuleFor(x => x.DataType).IsInEnum();
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
    }
}
