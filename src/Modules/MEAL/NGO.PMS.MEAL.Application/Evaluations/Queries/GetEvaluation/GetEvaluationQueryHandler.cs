using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.MEAL.Application.Evaluations.Queries.GetEvaluation;

public class GetEvaluationQueryHandler : IRequestHandler<GetEvaluationQuery, EvaluationDto>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public GetEvaluationQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<EvaluationDto> Handle(GetEvaluationQuery request, CancellationToken ct)
    {
        var evaluation = await _db.Evaluations
            .Include(e => e.Findings)
            .FirstOrDefaultAsync(e => e.Id == request.EvaluationId, ct)
            ?? throw new NotFoundException("Evaluation", request.EvaluationId);

        return _mapper.Map<EvaluationDto>(evaluation);
    }
}
