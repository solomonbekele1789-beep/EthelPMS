using MediatR;
using NGO.PMS.Participants.Domain.Enums;

namespace NGO.PMS.Participants.Application.Participants.Commands.RegisterParticipant;

public sealed record RegisterParticipantCommand(
    string FirstName,
    string LastName,
    Gender Gender,
    string? MiddleName,
    DateOnly? DateOfBirth,
    string? IdNumber,
    string? Phone) : IRequest<Guid>;
