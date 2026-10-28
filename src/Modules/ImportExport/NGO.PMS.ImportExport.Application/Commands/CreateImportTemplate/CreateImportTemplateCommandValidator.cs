using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.CreateImportTemplate;

public sealed class CreateImportTemplateCommandValidator : AbstractValidator<CreateImportTemplateCommand>
{
    public CreateImportTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ColumnMappings).NotEmpty();
        RuleFor(x => x.FileFormat).IsInEnum();
    }
}
