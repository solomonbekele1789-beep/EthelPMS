using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.GetParticipant;

public sealed record GetParticipantQuery(Guid ParticipantId) : IRequest<ParticipantDto>;
