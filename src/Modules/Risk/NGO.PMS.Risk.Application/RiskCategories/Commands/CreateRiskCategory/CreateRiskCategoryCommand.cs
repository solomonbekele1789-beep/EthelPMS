using MediatR;

namespace NGO.PMS.Risk.Application.RiskCategories.Commands.CreateRiskCategory;

public sealed record CreateRiskCategoryCommand(
    string Name,
    string? Description = null,
    string? Color = null,
    int SortOrder = 0) : IRequest<Guid>;
