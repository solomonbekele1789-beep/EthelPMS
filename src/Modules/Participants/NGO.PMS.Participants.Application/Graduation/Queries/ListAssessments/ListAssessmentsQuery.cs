using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListAssessments;

public sealed record ListAssessmentsQuery(
    Guid ParticipantId,
    Guid? BenchmarkId) : IRequest<List<GraduationAssessmentDto>>;
