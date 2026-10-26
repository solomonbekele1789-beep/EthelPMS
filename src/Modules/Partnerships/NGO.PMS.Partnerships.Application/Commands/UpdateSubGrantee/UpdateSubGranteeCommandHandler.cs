using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.UpdateSubGrantee;

public sealed class UpdateSubGranteeCommandHandler : IRequestHandler<UpdateSubGranteeCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public UpdateSubGranteeCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(UpdateSubGranteeCommand request, CancellationToken ct)
    {
        var entity = await _db.SubGrantees
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.SubGrantee), request.Id);

        entity.Update(
            request.Name,
            request.ContactPerson,
            request.ContactEmail,
            request.ContactPhone,
            request.Address,
            request.Notes);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
