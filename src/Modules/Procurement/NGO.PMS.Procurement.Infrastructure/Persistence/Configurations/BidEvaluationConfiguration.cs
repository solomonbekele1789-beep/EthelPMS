using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class BidEvaluationConfiguration : IEntityTypeConfiguration<BidEvaluation>
{
    public void Configure(EntityTypeBuilder<BidEvaluation> builder)
    {
        builder.ToTable("bid_evaluations");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TechnicalScore).HasPrecision(5, 2);
        builder.Property(e => e.FinancialScore).HasPrecision(5, 2);
        builder.Property(e => e.TotalWeightedScore).HasPrecision(5, 2);
        builder.Property(e => e.TechnicalWeight).HasPrecision(3, 2);
        builder.Property(e => e.FinancialWeight).HasPrecision(3, 2);
        builder.Property(e => e.EvaluationNotes).HasMaxLength(4000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => new { e.RfqId, e.SupplierId });
        builder.HasIndex(e => e.RfqResponseId);
    }
}
