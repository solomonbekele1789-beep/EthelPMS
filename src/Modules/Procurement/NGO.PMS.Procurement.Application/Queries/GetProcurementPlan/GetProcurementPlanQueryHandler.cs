using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Queries.GetProcurementPlan;

public sealed class GetProcurementPlanQueryHandler : IRequestHandler<GetProcurementPlanQuery, ProcurementPlanDto>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetProcurementPlanQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<ProcurementPlanDto> Handle(GetProcurementPlanQuery request, CancellationToken ct)
    {
        var plan = await _db.ProcurementPlans
            .AsNoTracking()
            .Include(p => p.Items)
            .Where(p => p.Id == request.PlanId && p.OrganizationId == _currentUser.OrganizationId)
            .ProjectTo<ProcurementPlanDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessRuleException("Procurement plan not found.");

        return plan;
    }
}
