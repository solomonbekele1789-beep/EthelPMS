using MediatR;
using NGO.PMS.Planning.Application.Common;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.Planning.Domain.Enums;

namespace NGO.PMS.Planning.Application.Plans.Queries.ListPlanEntries;

public record ListPlanEntriesQuery(
    Guid ProjectId,
    PlanLevel? Level,
    Guid? ParentId,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<PlanEntryListItemDto>>;
