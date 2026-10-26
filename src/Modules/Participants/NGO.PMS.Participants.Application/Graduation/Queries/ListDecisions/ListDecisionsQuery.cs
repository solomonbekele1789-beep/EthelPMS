using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListDecisions;

public sealed record ListDecisionsQuery(
    Guid? ProjectId,
    Guid? ParticipantId) : IRequest<List<GraduationDecisionDto>>;
