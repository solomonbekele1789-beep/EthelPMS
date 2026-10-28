using MediatR;

namespace NGO.PMS.Training.Application.Commands.AddTrainingMaterial;

public sealed record AddTrainingMaterialCommand(
    Guid TrainingProgramId,
    string Title,
    string MaterialType,
    string? Description,
    string? FileUrl) : IRequest<Guid>;
