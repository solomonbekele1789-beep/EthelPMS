using MediatR;
using NGO.PMS.Training.Application.DTOs;

namespace NGO.PMS.Training.Application.Queries.GetTrainingSession;

public sealed record GetTrainingSessionQuery(Guid SessionId) : IRequest<TrainingSessionDto>;
