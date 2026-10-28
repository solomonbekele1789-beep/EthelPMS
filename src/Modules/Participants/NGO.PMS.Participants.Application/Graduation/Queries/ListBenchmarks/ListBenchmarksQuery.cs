using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListBenchmarks;

public sealed record ListBenchmarksQuery(
    Guid? ProjectId,
    bool? ActiveOnly) : IRequest<List<GraduationBenchmarkDto>>;
