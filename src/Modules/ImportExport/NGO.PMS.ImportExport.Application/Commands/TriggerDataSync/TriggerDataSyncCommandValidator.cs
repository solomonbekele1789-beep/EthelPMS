using FluentValidation;

namespace NGO.PMS.ImportExport.Application.Commands.TriggerDataSync;

public sealed class TriggerDataSyncCommandValidator : AbstractValidator<TriggerDataSyncCommand>
{
    public TriggerDataSyncCommandValidator()
    {
        RuleFor(x => x.DataSyncConfigId).NotEmpty();
    }
}
