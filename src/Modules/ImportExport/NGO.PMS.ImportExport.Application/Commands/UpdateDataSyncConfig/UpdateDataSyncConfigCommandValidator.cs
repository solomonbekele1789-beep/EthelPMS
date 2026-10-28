using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.UpdateDataSyncConfig;

public sealed class UpdateDataSyncConfigCommandValidator : AbstractValidator<UpdateDataSyncConfigCommand>
{
    public UpdateDataSyncConfigCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.SourceUrl).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.MappingConfig).NotEmpty();
    }
}
