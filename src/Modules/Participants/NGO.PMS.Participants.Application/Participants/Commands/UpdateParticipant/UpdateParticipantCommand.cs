using MediatR;
using NGO.PMS.Participants.Domain.Enums;

namespace NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipant;

public sealed record UpdateParticipantCommand(
    Guid ParticipantId,
    string FirstName,
    string LastName,
    string? MiddleName,
    Gender Gender,
    DateOnly? DateOfBirth,
    string? Phone,
    string? Email,
    string? IdNumber) : IRequest;
