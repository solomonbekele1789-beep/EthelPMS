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

    public CreateOfficeCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateOfficeCommand request, CancellationToken cancellationToken)
    {
        var codeExists = await _db.Offices.AnyAsync(
            o => o.Code == request.Code && o.OrganizationId == _currentUser.OrganizationId,
            cancellationToken);
        if (codeExists)
            throw new BusinessRuleException($"An office with code '{request.Code}' already exists.");

        var officeType = string.IsNullOrWhiteSpace(request.OfficeType) ? "HeadOffice" : request.OfficeType.Trim();

        Guid? parentOfficeId = request.ParentOfficeId;

        if (officeType.Equals("HeadOffice", StringComparison.OrdinalIgnoreCase))
        {
            parentOfficeId = null;
        }
        else if (officeType.Equals("AreaOffice", StringComparison.OrdinalIgnoreCase))
        {
            if (!parentOfficeId.HasValue)
                throw new BusinessRuleException("An Area Office must be associated with a valid Head Office.");

            var parent = await _db.Offices.FirstOrDefaultAsync(
                o => o.Id == parentOfficeId.Value && o.OrganizationId == _currentUser.OrganizationId,
                cancellationToken);
            if (parent == null)
                throw new NotFoundException("Head Office", parentOfficeId.Value);

            if (!parent.OfficeType.Equals("HeadOffice", StringComparison.OrdinalIgnoreCase))
                throw new BusinessRuleException("The selected parent office must be a Head Office.");
        }
        else if (officeType.Equals("BranchOffice", StringComparison.OrdinalIgnoreCase))
        {
            if (!parentOfficeId.HasValue)
                throw new BusinessRuleException("A Branch Office must be associated with a valid Area Office.");

            var parent = await _db.Offices.FirstOrDefaultAsync(
                o => o.Id == parentOfficeId.Value && o.OrganizationId == _currentUser.OrganizationId,
                cancellationToken);
            if (parent == null)
                throw new NotFoundException("Area Office", parentOfficeId.Value);

            if (!parent.OfficeType.Equals("AreaOffice", StringComparison.OrdinalIgnoreCase))
                throw new BusinessRuleException("The selected parent office must be an Area Office.");
        }

        var office = Office.Create(
            request.Name,
            request.Code,
            _currentUser.OrganizationId,
            officeType,
            request.Description,
            request.LocationAddress,
            request.Latitude,
            request.Longitude,
            request.IsActive,
            parentOfficeId,
            request.LocationId);

        _db.Offices.Add(office);
        await _db.SaveChangesAsync(cancellationToken);
        return office.Id;
    }
}
