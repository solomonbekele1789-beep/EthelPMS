using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Training.Application.Commands.UpdateTrainingProgram;

public class UpdateTrainingProgramCommandHandler : IRequestHandler<UpdateTrainingProgramCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateTrainingProgramCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(UpdateTrainingProgramCommand request, CancellationToken ct)
    {
        var program = await _db.TrainingPrograms
            .FirstOrDefaultAsync(p => p.Id == request.ProgramId, ct);

        if (program is null)
            throw new NotFoundException(nameof(Domain.Entities.TrainingProgram), request.ProgramId);

        program.Update(request.Title, request.Category, request.TotalSessions, request.Description);
        await _db.SaveChangesAsync(ct);
        return program.Id;
    }
}
