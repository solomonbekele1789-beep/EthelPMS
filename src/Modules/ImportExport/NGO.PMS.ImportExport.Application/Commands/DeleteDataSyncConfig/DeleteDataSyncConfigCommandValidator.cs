using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.DeleteDataSyncConfig;

public sealed class DeleteDataSyncConfigCommandValidator : AbstractValidator<DeleteDataSyncConfigCommand>
{
    public DeleteDataSyncConfigCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
