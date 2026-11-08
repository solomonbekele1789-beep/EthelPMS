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

        var officeType = string.IsNullOrWhiteSpace(request.OfficeType) ? office.OfficeType : request.OfficeType.Trim();
        Guid? parentOfficeId = request.ParentOfficeId;

        if (officeType.Equals("HeadOffice", StringComparison.OrdinalIgnoreCase))
        {
            parentOfficeId = null;
        }
        else if (officeType.Equals("AreaOffice", StringComparison.OrdinalIgnoreCase))
        {
            if (!parentOfficeId.HasValue)
                throw new BusinessRuleException("An Area Office must be associated with a valid Head Office.");

            if (parentOfficeId.Value == office.Id)
                throw new BusinessRuleException("An office cannot be its own parent.");

            var parent = await _db.Offices.FirstOrDefaultAsync(
                o => o.Id == parentOfficeId.Value && o.OrganizationId == office.OrganizationId,
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

            if (parentOfficeId.Value == office.Id)
                throw new BusinessRuleException("An office cannot be its own parent.");

            var parent = await _db.Offices.FirstOrDefaultAsync(
                o => o.Id == parentOfficeId.Value && o.OrganizationId == office.OrganizationId,
                cancellationToken);
            if (parent == null)
                throw new NotFoundException("Area Office", parentOfficeId.Value);

            if (!parent.OfficeType.Equals("AreaOffice", StringComparison.OrdinalIgnoreCase))
                throw new BusinessRuleException("The selected parent office must be an Area Office.");
        }

        office.Update(
            request.Name,
            request.Code,
            officeType,
            request.Description,
            request.LocationAddress,
            request.Latitude,
            request.Longitude,
            request.IsActive,
            parentOfficeId,
            request.LocationId);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
