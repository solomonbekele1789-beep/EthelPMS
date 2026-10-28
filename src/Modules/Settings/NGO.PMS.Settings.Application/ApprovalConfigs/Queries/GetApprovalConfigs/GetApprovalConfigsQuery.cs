using MediatR;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Queries.GetApprovalConfigs;

public record GetApprovalConfigsQuery(string? Module = null) : IRequest<List<ApprovalConfigDto>>;
