using FluentValidation;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;

public class ToggleModuleCommandValidator : AbstractValidator<ToggleModuleCommand>
{
    public ToggleModuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.ModuleName).NotEmpty();
    }
}
