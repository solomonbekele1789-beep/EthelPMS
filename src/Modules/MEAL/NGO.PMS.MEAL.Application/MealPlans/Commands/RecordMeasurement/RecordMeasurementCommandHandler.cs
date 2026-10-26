using MediatR;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.RecordMeasurement;

public class RecordMeasurementCommandHandler : IRequestHandler<RecordMeasurementCommand, Guid>
{
    private readonly IMealDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordMeasurementCommandHandler(IMealDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RecordMeasurementCommand request, CancellationToken ct)
    {
        var measurement = IndicatorMeasurement.Create(
            request.MealIndicatorId, request.Period, request.Value,
            request.MeasurementDate, _currentUser.OrganizationId,
            _currentUser.UserId, request.Notes,
            request.Male, request.Female);

        _db.IndicatorMeasurements.Add(measurement);
        await _db.SaveChangesAsync(ct);
        return measurement.Id;
    }
}
