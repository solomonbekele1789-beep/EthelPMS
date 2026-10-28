using MediatR;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Application.AlertThresholds.Commands.CreateAlertThreshold;

public class CreateAlertThresholdCommandHandler : IRequestHandler<CreateAlertThresholdCommand, Guid>
{
    private readonly ISettingsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateAlertThresholdCommandHandler(ISettingsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateAlertThresholdCommand request, CancellationToken cancellationToken)
    {
        var threshold = AlertThreshold.Create(
            _currentUser.OrganizationId,
            request.Module,
            request.MetricName,
            request.ThresholdValue,
            request.Operator,
            request.AlertSeverity,
            request.IsActive);

        _db.AlertThresholds.Add(threshold);
        await _db.SaveChangesAsync(cancellationToken);

        return threshold.Id;
    }
}
