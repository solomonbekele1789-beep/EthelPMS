using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.StartExport;

public sealed class StartExportCommandValidator : AbstractValidator<StartExportCommand>
{
    public StartExportCommandValidator()
    {
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ExportFormat).IsInEnum();
    }
}
