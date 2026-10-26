using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.StartImport;

public sealed class StartImportCommandValidator : AbstractValidator<StartImportCommand>
{
    public StartImportCommandValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(500);
        RuleFor(x => x.FileSize).GreaterThan(0);
        RuleFor(x => x.FileStoragePath).NotEmpty();
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(100);
    }
}
