using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Training.Application.Queries.GetTrainingSession;

public class GetTrainingSessionQueryHandler : IRequestHandler<GetTrainingSessionQuery, TrainingSessionDto>
{
    private readonly ITrainingDbContext _db;
    private readonly IMapper _mapper;

    public GetTrainingSessionQueryHandler(ITrainingDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<TrainingSessionDto> Handle(GetTrainingSessionQuery request, CancellationToken cancellationToken)
    {
        var session = await _db.TrainingSessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session is null)
            throw new NotFoundException(nameof(Domain.Entities.TrainingSession), request.SessionId);

        return _mapper.Map<TrainingSessionDto>(session);
    }
}
