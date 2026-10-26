using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.ListMeasurements;

public class ListMeasurementsQueryHandler : IRequestHandler<ListMeasurementsQuery, List<IndicatorMeasurementDto>>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public ListMeasurementsQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<IndicatorMeasurementDto>> Handle(ListMeasurementsQuery request, CancellationToken ct)
    {
        return await _db.IndicatorMeasurements
            .Where(m => m.MealIndicatorId == request.MealIndicatorId)
            .OrderBy(m => m.MeasurementDate)
            .ProjectTo<IndicatorMeasurementDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
