using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateIndicator;

public class CreateIndicatorCommandHandler : IRequestHandler<CreateIndicatorCommand, Guid>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateIndicatorCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateIndicatorCommand request, CancellationToken ct)
    {
        var projectExists = await _db.Projects
            .AnyAsync(p => p.Id == request.ProjectId, ct);
        if (!projectExists)
            throw new NotFoundException("Project", request.ProjectId);

        var indicator = Indicator.Create(
            request.Code, request.Name, request.ProjectId, _currentUser.OrganizationId);

        if (request.OutcomeId.HasValue)
            indicator.LinkToOutcome(request.OutcomeId.Value);
        else if (request.OutputId.HasValue)
            indicator.LinkToOutput(request.OutputId.Value);

        indicator.Update(request.Name, null, request.BaselineValue, request.TargetValue,
            request.DataSource, request.CollectionFrequency, null, request.UnitOfMeasurementId);

        _db.Indicators.Add(indicator);
        await _db.SaveChangesAsync(ct);
        return indicator.Id;
    }
}
