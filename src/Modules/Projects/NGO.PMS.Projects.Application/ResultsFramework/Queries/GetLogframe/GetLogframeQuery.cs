using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.ResultsFramework.Queries.GetLogframe;

public record GetLogframeQuery(Guid ProjectId) : IRequest<LogframeDto>;
