using FluentAssertions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.ImportExport.Domain.Events;

namespace NGO.PMS.ImportExport.Tests.Domain;

public class ExportJobTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    private ExportJob CreatePendingExport()
        => ExportJob.Create(_orgId, _userId, "Donors", "Donor",
            ExportFormat.Excel, "{\"status\":\"Active\"}");

    [Fact]
    public void Should_Create_ExportJob_As_Pending()
    {
        var job = CreatePendingExport();

        job.Should().NotBeNull();
        job.Id.Should().NotBeEmpty();
        job.OrganizationId.Should().Be(_orgId);
        job.ExportedById.Should().Be(_userId);
        job.Module.Should().Be("Donors");
        job.EntityType.Should().Be("Donor");
        job.ExportFormat.Should().Be(ExportFormat.Excel);
        job.FilterCriteria.Should().Be("{\"status\":\"Active\"}");
        job.Status.Should().Be(ExportJobStatus.Pending);
        job.FileName.Should().BeNull();
        job.FileSize.Should().BeNull();
        job.StartedAt.Should().BeNull();

        job.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ExportJobCreatedEvent>()
            .Which.Module.Should().Be("Donors");
    }

    [Fact]
    public void Should_Start_Processing()
    {
        var job = CreatePendingExport();
        job.ClearDomainEvents();

        job.Start();

        job.Status.Should().Be(ExportJobStatus.Processing);
        job.StartedAt.Should().NotBeNull();
        job.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Should_Complete_With_FileInfo()
    {
        var job = CreatePendingExport();
        job.Start();

        job.Complete("donors-export.xlsx", 204800, "/exports/donors-export.xlsx", 1500);

        job.Status.Should().Be(ExportJobStatus.Completed);
        job.FileName.Should().Be("donors-export.xlsx");
        job.FileSize.Should().Be(204800);
        job.FileStoragePath.Should().Be("/exports/donors-export.xlsx");
        job.TotalRecords.Should().Be(1500);
        job.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Should_Fail()
    {
        var job = CreatePendingExport();
        job.Start();

        job.Fail();

        job.Status.Should().Be(ExportJobStatus.Failed);
        job.CompletedAt.Should().NotBeNull();
        job.FileName.Should().BeNull();
    }
}
