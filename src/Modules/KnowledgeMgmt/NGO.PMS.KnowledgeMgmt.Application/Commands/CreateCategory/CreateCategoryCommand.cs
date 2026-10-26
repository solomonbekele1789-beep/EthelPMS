using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.CreateCategory;

public sealed record CreateCategoryCommand(
    string Name,
    string? Description,
    Guid? ParentCategoryId,
    int SortOrder) : IRequest<Guid>;
