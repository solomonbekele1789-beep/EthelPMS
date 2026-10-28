using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.CancelImport;

public sealed class CancelImportCommandValidator : AbstractValidator<CancelImportCommand>
{
    public CancelImportCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
