using MediatR;

namespace NGO.PMS.Participants.Application.Participants.Commands.ExitEnrollment;

public sealed record ExitEnrollmentCommand(
    Guid EnrollmentId,
    string Reason) : IRequest;
