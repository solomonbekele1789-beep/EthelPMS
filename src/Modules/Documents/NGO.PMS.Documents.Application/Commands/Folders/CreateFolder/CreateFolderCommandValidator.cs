using FluentValidation;

namespace NGO.PMS.Documents.Application.Commands.Folders.CreateFolder;

public sealed class CreateFolderCommandValidator : AbstractValidator<CreateFolderCommand>
{
    public CreateFolderCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
