using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Queries.ListFundCodes;

public sealed class ListFundCodesQueryHandler
    : IRequestHandler<ListFundCodesQuery, List<FundCodeDto>>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListFundCodesQueryHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<List<FundCodeDto>> Handle(
        ListFundCodesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.FundCodes
            .AsNoTracking()
            .Where(x => x.OrganizationId == _currentUser.OrganizationId);

        if (request.FundType.HasValue)
            query = query.Where(x => x.FundType == request.FundType.Value);

        if (request.IsActive.HasValue)
            query = query.Where(x => x.IsActive == request.IsActive.Value);

        return await query
            .OrderBy(x => x.Code)
            .ProjectTo<FundCodeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
