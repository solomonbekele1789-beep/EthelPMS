using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListParticipantServices;

public sealed record ListParticipantServicesQuery(
    Guid ParticipantId,
    Guid? ProjectId) : IRequest<List<ParticipantServiceDto>>;
