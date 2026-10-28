using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.DeleteAlertThreshold;

public class DeleteAlertThresholdCommandHandler : IRequestHandler<DeleteAlertThresholdCommand>
{
    private readonly ISettingsDbContext _db;

    public DeleteAlertThresholdCommandHandler(ISettingsDbContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteAlertThresholdCommand request, CancellationToken cancellationToken)
    {
        var threshold = await _db.AlertThresholds
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("AlertThreshold", request.Id);

        _db.AlertThresholds.Remove(threshold);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
