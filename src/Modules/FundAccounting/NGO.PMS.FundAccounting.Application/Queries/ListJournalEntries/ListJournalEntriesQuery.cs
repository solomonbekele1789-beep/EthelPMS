using MediatR;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Queries.ListJournalEntries;

public sealed record ListJournalEntriesQuery(
    Guid? ProjectId,
    Guid? FundCodeId,
    JournalEntryStatus? Status,
    int Page,
    int PageSize) : IRequest<PagedResult<JournalEntryDto>>;
