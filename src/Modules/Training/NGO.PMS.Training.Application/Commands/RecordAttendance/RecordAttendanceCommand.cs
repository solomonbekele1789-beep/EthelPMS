using MediatR;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Commands.RecordAttendance;

public sealed record RecordAttendanceCommand(
    Guid TrainingParticipantId,
    AttendanceStatus Status) : IRequest<Guid>;
