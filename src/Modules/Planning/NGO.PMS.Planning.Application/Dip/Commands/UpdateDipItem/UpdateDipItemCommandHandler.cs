using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Dip.Commands.UpdateDipItem;

public class UpdateDipItemCommandHandler : IRequestHandler<UpdateDipItemCommand>
{
    private readonly IPlanningDbContext _db;

    public UpdateDipItemCommandHandler(IPlanningDbContext db) => _db = db;

    public async Task Handle(UpdateDipItemCommand request, CancellationToken ct)
    {
        var dip = await _db.DipItems
            .FirstOrDefaultAsync(d => d.Id == request.DipItemId, ct)
            ?? throw new NotFoundException("DIP item", request.DipItemId);

        dip.Update(request.Title, request.Description, request.PlannedStartDate, request.PlannedEndDate, request.BudgetAllocated, request.SortOrder);
        await _db.SaveChangesAsync(ct);
    }
}
