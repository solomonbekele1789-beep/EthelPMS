using MediatR;

namespace NGO.PMS.Planning.Application.Dip.Commands.UpdateDipItem;

public record UpdateDipItemCommand(
    Guid DipItemId,
    string Title,
    string? Description,
    DateTimeOffset PlannedStartDate,
    DateTimeOffset PlannedEndDate,
    decimal BudgetAllocated,
    int SortOrder) : IRequest;
