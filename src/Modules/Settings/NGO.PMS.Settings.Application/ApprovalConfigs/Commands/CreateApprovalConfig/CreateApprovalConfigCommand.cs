using MediatR;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.CreateApprovalConfig;

public record CreateApprovalConfigCommand(
    string Module,
    string EntityType,
    int RequiredApprovalLevels,
    decimal? AutoApproveBelow,
    bool IsActive) : IRequest<Guid>;
