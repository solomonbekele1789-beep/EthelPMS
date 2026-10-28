using MediatR;

namespace NGO.PMS.Participants.Application.Participants.Commands.RecordService;

public sealed record RecordServiceCommand(
    Guid ParticipantId,
    Guid ProjectId,
    string ServiceName,
    DateTimeOffset ServiceDate,
    Guid? ActivityId,
    string? Description,
    decimal? Quantity,
    string? Unit) : IRequest<Guid>;
