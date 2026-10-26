using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateIndicator;

public class UpdateIndicatorCommandHandler : IRequestHandler<UpdateIndicatorCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateIndicatorCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateIndicatorCommand request, CancellationToken ct)
    {
        var indicator = await _db.Indicators
            .FirstOrDefaultAsync(i => i.Id == request.IndicatorId, ct)
            ?? throw new NotFoundException("Indicator", request.IndicatorId);

        indicator.Update(request.Name, request.Description, request.BaselineValue, request.TargetValue,
            request.DataSource, request.CollectionFrequency, request.MeansOfVerification, request.UnitOfMeasurementId);

        await _db.SaveChangesAsync(ct);
    }
}
