using MediatR;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Application.Participants.Commands.RecordService;

public class RecordServiceCommandHandler : IRequestHandler<RecordServiceCommand, Guid>
{
    private readonly IParticipantsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordServiceCommandHandler(IParticipantsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RecordServiceCommand request, CancellationToken ct)
    {
        var service = ParticipantService.Create(
            request.ParticipantId, request.ProjectId, request.ServiceName,
            request.ServiceDate, _currentUser.OrganizationId,
            request.ActivityId, request.Description,
            request.Quantity, request.Unit);

        _db.ParticipantServices.Add(service);
        await _db.SaveChangesAsync(ct);
        return service.Id;
    }
}
