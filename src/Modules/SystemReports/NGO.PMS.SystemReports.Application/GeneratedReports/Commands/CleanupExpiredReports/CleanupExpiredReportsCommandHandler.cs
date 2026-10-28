using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.CleanupExpiredReports;

public class CleanupExpiredReportsCommandHandler : IRequestHandler<CleanupExpiredReportsCommand, int>
{
    private readonly ISystemReportsDbContext _db;

    public CleanupExpiredReportsCommandHandler(ISystemReportsDbContext db) => _db = db;

    public async Task<int> Handle(CleanupExpiredReportsCommand request, CancellationToken ct)
    {
        var expired = await _db.GeneratedReports
            .Where(r => r.ExpiresAt != null && r.ExpiresAt < DateTimeOffset.UtcNow)
            .ToListAsync(ct);

        if (expired.Count == 0)
            return 0;

        _db.GeneratedReports.RemoveRange(expired);
        await _db.SaveChangesAsync(ct);
        return expired.Count;
    }
}
