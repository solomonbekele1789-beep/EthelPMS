using MediatR;

namespace NGO.PMS.Settings.Application.ApprovalConfigs.Commands.UpdateApprovalConfig;

public record UpdateApprovalConfigCommand(
    Guid Id,
    int RequiredApprovalLevels,
    decimal? AutoApproveBelow,
    bool IsActive) : IRequest;
