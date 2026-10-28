using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.FundAccounting.Application.Commands.JournalEntries.PostJournalEntry;

public sealed record PostJournalEntryCommand(
    Guid JournalEntryId) : IRequest<Unit>;

public sealed class PostJournalEntryCommandHandler
    : IRequestHandler<PostJournalEntryCommand, Unit>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public PostJournalEntryCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        PostJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        var entry = await _db.JournalEntries
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.JournalEntryId
                && x.OrganizationId == _currentUser.OrganizationId,
                cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.JournalEntry), request.JournalEntryId);

        entry.Post();
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
