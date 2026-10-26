using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutput;

public class UpdateOutputCommandHandler : IRequestHandler<UpdateOutputCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateOutputCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateOutputCommand request, CancellationToken ct)
    {
        var output = await _db.Outputs
            .FirstOrDefaultAsync(o => o.Id == request.OutputId, ct)
            ?? throw new NotFoundException("Output", request.OutputId);

        output.Update(request.Description, request.BaselineValue, request.TargetValue, request.Assumptions);

        await _db.SaveChangesAsync(ct);
    }
}
