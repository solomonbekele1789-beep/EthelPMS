using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Offices.Commands.CreateOffice;

public class CreateOfficeCommandHandler : IRequestHandler<CreateOfficeCommand, Guid>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;
    public CreateOfficeCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser) { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateOfficeCommand request, CancellationToken cancellationToken)
    {
        var codeExists = await _db.Offices.AnyAsync(o => o.Code == request.Code && o.OrganizationId == _currentUser.OrganizationId, cancellationToken);
        if (codeExists) throw new BusinessRuleException($"An office with code '{request.Code}' already exists.");

        var office = Office.Create(request.Name, request.Code, _currentUser.OrganizationId, request.ParentOfficeId, request.LocationId);
        _db.Offices.Add(office);
        await _db.SaveChangesAsync(cancellationToken);
        return office.Id;
    }
}
