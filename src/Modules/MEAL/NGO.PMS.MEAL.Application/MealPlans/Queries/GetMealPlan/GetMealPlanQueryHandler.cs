using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.GetMealPlan;

public class GetMealPlanQueryHandler : IRequestHandler<GetMealPlanQuery, MealPlanDto>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public GetMealPlanQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<MealPlanDto> Handle(GetMealPlanQuery request, CancellationToken ct)
    {
        var mealPlan = await _db.MealPlans
            .Include(mp => mp.Indicators)
            .FirstOrDefaultAsync(mp => mp.Id == request.MealPlanId, ct)
            ?? throw new NotFoundException("MealPlan", request.MealPlanId);

        return _mapper.Map<MealPlanDto>(mealPlan);
    }
}
