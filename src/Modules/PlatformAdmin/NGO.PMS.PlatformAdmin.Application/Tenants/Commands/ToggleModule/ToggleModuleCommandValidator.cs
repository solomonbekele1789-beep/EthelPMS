using FluentValidation;
using NGO.PMS.PlatformAdmin.Domain.Constants;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;

public class ToggleModuleCommandValidator : AbstractValidator<ToggleModuleCommand>
{
    public ToggleModuleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.ModuleName)
            .NotEmpty()
            .Must(m => PlatformModules.All.Contains(m, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Module name must be a valid platform module.");
    }
}
