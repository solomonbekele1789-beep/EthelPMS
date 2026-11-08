using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteOutput;

public class DeleteOutputCommandHandler : IRequestHandler<DeleteOutputCommand>
{
    private readonly IProjectsDbContext _db;

    public DeleteOutputCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(DeleteOutputCommand request, CancellationToken ct)
    {
        var output = await _db.Outputs
            .FirstOrDefaultAsync(o => o.Id == request.OutputId, ct)
            ?? throw new NotFoundException("Output", request.OutputId);

        var hasActivities = await _db.Activities.AnyAsync(a => a.OutputId == request.OutputId, ct);
        if (hasActivities)
            throw new BusinessRuleException("Cannot delete an output that contains activities. Please remove its activities first.");

        _db.Outputs.Remove(output);
        await _db.SaveChangesAsync(ct);
    }
}
