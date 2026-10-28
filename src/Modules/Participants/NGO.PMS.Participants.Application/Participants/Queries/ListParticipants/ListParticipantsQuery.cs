using MediatR;
using NGO.PMS.Participants.Application.DTOs;
using NGO.PMS.Participants.Domain.Enums;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListParticipants;

public sealed record ListParticipantsQuery(
    Guid? ProjectId,
    ParticipantStatus? Status,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ParticipantListItemDto>>;
