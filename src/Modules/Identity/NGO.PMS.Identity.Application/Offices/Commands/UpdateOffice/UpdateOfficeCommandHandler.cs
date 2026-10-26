using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Offices.Commands.UpdateOffice;

public class UpdateOfficeCommandHandler : IRequestHandler<UpdateOfficeCommand>
{
    private readonly IIdentityDbContext _db;
    public UpdateOfficeCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(UpdateOfficeCommand request, CancellationToken cancellationToken)
    {
        var office = await _db.Offices.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Office", request.Id);
        office.Update(request.Name, request.Code, request.ParentOfficeId, request.LocationId);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
