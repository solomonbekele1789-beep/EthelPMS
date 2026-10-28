using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteImportTemplate;

public sealed class DeleteImportTemplateCommandValidator : AbstractValidator<DeleteImportTemplateCommand>
{
    public DeleteImportTemplateCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
