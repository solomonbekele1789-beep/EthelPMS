using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Queries.GetBudget;

public sealed class GetBudgetQueryHandler
    : IRequestHandler<GetBudgetQuery, BudgetDto>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetBudgetQueryHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<BudgetDto> Handle(
        GetBudgetQuery request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.Budgets
            .AsNoTracking()
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.BudgetId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Budget), request.BudgetId);

        return _mapper.Map<BudgetDto>(budget);
    }
}
