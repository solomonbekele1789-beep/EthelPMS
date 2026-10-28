using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Offices.Commands.DeleteOffice;

public class DeleteOfficeCommandHandler : IRequestHandler<DeleteOfficeCommand>
{
    private readonly IIdentityDbContext _db;
    public DeleteOfficeCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(DeleteOfficeCommand request, CancellationToken cancellationToken)
    {
        var office = await _db.Offices.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Office", request.Id);
        var hasUsers = await _db.Users.AnyAsync(u => u.OfficeId == request.Id, cancellationToken);
        if (hasUsers) throw new BusinessRuleException("Cannot delete an office with assigned users.");
        _db.Offices.Remove(office);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
