using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Risk.Application.Abstractions;

public interface IRiskDbContext
{
    DbSet<RiskCategory> RiskCategories { get; }
    DbSet<Domain.Entities.Risk> Risks { get; }
    DbSet<RiskMitigation> RiskMitigations { get; }
    DbSet<RiskAssessment> RiskAssessments { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
