using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingProgram;

public class CreateTrainingProgramCommandHandler : IRequestHandler<CreateTrainingProgramCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTrainingProgramCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateTrainingProgramCommand request, CancellationToken ct)
    {
        var program = TrainingProgram.Create(
            request.Title, request.Category, request.ProjectId,
            request.TotalSessions, request.Description);

        _db.TrainingPrograms.Add(program);
        await _db.SaveChangesAsync(ct);
        return program.Id;
    }
}
