using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutput;

public class CreateOutputCommandHandler : IRequestHandler<CreateOutputCommand, Guid>
{
    private readonly IProjectsDbContext _db;

    public CreateOutputCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateOutputCommand request, CancellationToken ct)
    {
        var outcome = await _db.Outcomes
            .FirstOrDefaultAsync(o => o.Id == request.OutcomeId, ct)
            ?? throw new NotFoundException("Outcome", request.OutcomeId);

        var output = Output.Create(
            request.Code, request.Description, request.OutcomeId, outcome.OrganizationId);

        if (request.BaselineValue is not null || request.TargetValue is not null)
            output.Update(request.Description, request.BaselineValue, request.TargetValue, null);

        _db.Outputs.Add(output);
        await _db.SaveChangesAsync(ct);
        return output.Id;
    }
}
