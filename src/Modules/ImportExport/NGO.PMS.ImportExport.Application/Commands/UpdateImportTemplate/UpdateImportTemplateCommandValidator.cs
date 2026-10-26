using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateImportTemplate;

public sealed class UpdateImportTemplateCommandValidator : AbstractValidator<UpdateImportTemplateCommand>
{
    public UpdateImportTemplateCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.ColumnMappings).NotEmpty();
    }
}
