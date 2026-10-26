using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Partnerships.Application.Abstractions;

public interface IPartnershipsDbContext
{
    DbSet<SubGrantee> SubGrantees { get; }
    DbSet<Disbursement> Disbursements { get; }
    DbSet<PartnerReport> PartnerReports { get; }
    DbSet<PartnerCompliance> PartnerCompliances { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
