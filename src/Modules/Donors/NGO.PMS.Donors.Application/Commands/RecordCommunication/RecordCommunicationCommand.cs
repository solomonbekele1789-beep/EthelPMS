using MediatR;
using NGO.PMS.Donors.Domain.Enums;

namespace NGO.PMS.Donors.Application.Commands.RecordCommunication;

public sealed record RecordCommunicationCommand(
    Guid DonorId,
    Guid? GrantId,
    CommunicationType Type,
    string Subject,
    string? Content,
    DateTime CommunicationDate,
    string ContactedBy,
    string? Outcome) : IRequest<Guid>;
