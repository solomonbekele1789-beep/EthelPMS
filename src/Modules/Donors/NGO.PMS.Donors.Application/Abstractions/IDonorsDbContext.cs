using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Donors.Application.Abstractions;

public interface IDonorsDbContext
{
    DbSet<Donor> Donors { get; }
    DbSet<DonorContact> DonorContacts { get; }
    DbSet<Grant> Grants { get; }
    DbSet<GrantCondition> GrantConditions { get; }
    DbSet<GrantReport> GrantReports { get; }
    DbSet<DonorCommunication> DonorCommunications { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
