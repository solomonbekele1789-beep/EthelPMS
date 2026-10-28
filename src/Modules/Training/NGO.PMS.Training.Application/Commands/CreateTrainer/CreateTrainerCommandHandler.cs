using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.CreateTrainer;

public class CreateTrainerCommandHandler : IRequestHandler<CreateTrainerCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTrainerCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateTrainerCommand request, CancellationToken ct)
    {
        var trainer = Trainer.Create(
            request.FullName, request.IsInternal, request.Email,
            request.Phone, request.Specialization, request.Organization);

        _db.Trainers.Add(trainer);
        await _db.SaveChangesAsync(ct);
        return trainer.Id;
    }
}
