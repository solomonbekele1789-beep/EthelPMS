using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.CreateDataSyncConfig;

public sealed class CreateDataSyncConfigCommandValidator : AbstractValidator<CreateDataSyncConfigCommand>
{
    public CreateDataSyncConfigCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.SourceType).IsInEnum();
        RuleFor(x => x.SourceUrl).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.TargetModule).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TargetEntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MappingConfig).NotEmpty();
    }
}
