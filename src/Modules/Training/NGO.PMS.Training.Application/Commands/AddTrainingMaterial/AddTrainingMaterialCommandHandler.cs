using MediatR;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Application.Commands.AddTrainingMaterial;

public class AddTrainingMaterialCommandHandler : IRequestHandler<AddTrainingMaterialCommand, Guid>
{
    private readonly ITrainingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddTrainingMaterialCommandHandler(ITrainingDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddTrainingMaterialCommand request, CancellationToken ct)
    {
        var material = TrainingMaterial.Create(
            request.TrainingProgramId, request.Title, request.MaterialType,
            request.Description, request.FileUrl);

        _db.TrainingMaterials.Add(material);
        await _db.SaveChangesAsync(ct);
        return material.Id;
    }
}
