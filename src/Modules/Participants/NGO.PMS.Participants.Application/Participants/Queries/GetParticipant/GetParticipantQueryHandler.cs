using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Participants.Application.Participants.Queries.GetParticipant;

public class GetParticipantQueryHandler : IRequestHandler<GetParticipantQuery, ParticipantDto>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public GetParticipantQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ParticipantDto> Handle(GetParticipantQuery request, CancellationToken cancellationToken)
    {
        var participant = await _db.Participants
            .Include(p => p.Enrollments)
            .FirstOrDefaultAsync(p => p.Id == request.ParticipantId, cancellationToken);

        if (participant is null)
            throw new NotFoundException(nameof(Domain.Entities.Participant), request.ParticipantId);

        return _mapper.Map<ParticipantDto>(participant);
    }
}
