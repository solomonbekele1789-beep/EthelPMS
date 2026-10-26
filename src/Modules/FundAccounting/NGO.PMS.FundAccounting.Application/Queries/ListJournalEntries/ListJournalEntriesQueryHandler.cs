using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Queries.ListJournalEntries;

public sealed class ListJournalEntriesQueryHandler
    : IRequestHandler<ListJournalEntriesQuery, PagedResult<JournalEntryDto>>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListJournalEntriesQueryHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<PagedResult<JournalEntryDto>> Handle(
        ListJournalEntriesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.JournalEntries
            .AsNoTracking()
            .Where(x => x.OrganizationId == _currentUser.OrganizationId);

        if (request.ProjectId.HasValue)
            query = query.Where(x => x.ProjectId == request.ProjectId.Value);

        if (request.FundCodeId.HasValue)
            query = query.Where(x => x.FundCodeId == request.FundCodeId.Value);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var entries = await query
            .Include(x => x.Lines)
            .OrderByDescending(x => x.TransactionDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<JournalEntryDto>
        {
            Items = _mapper.Map<List<JournalEntryDto>>(entries),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
