using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.UpdateAlertThreshold;

public class UpdateAlertThresholdCommandHandler : IRequestHandler<UpdateAlertThresholdCommand>
{
    private readonly ISettingsDbContext _db;

    public UpdateAlertThresholdCommandHandler(ISettingsDbContext db)
    {
        _db = db;
    }

    public async Task Handle(UpdateAlertThresholdCommand request, CancellationToken cancellationToken)
    {
        var threshold = await _db.AlertThresholds
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("AlertThreshold", request.Id);

        threshold.Update(request.ThresholdValue, request.Operator, request.AlertSeverity, request.IsActive);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
