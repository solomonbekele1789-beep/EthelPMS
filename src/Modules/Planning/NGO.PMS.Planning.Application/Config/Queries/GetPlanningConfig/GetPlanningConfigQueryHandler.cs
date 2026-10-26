using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Application.Config.Queries.GetPlanningConfig;

public class GetPlanningConfigQueryHandler : IRequestHandler<GetPlanningConfigQuery, PlanningConfigurationDto>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetPlanningConfigQueryHandler(IPlanningDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<PlanningConfigurationDto> Handle(GetPlanningConfigQuery request, CancellationToken ct)
    {
        var config = await _db.PlanningConfigurations
            .FirstOrDefaultAsync(c => c.OrganizationId == _currentUser.OrganizationId, ct);

        if (config is null)
        {
            config = PlanningConfiguration.CreateDefault(_currentUser.OrganizationId);
            _db.PlanningConfigurations.Add(config);
            await _db.SaveChangesAsync(ct);
        }

        return _mapper.Map<PlanningConfigurationDto>(config);
    }
}
