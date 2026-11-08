using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteIndicator;

public class DeleteIndicatorCommandHandler : IRequestHandler<DeleteIndicatorCommand>
{
    private readonly IProjectsDbContext _db;

    public DeleteIndicatorCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(DeleteIndicatorCommand request, CancellationToken ct)
    {
        var indicator = await _db.Indicators
            .FirstOrDefaultAsync(i => i.Id == request.IndicatorId, ct)
            ?? throw new NotFoundException("Indicator", request.IndicatorId);

        _db.Indicators.Remove(indicator);
        await _db.SaveChangesAsync(ct);
    }
}
