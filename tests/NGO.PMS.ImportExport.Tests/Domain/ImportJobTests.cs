using FluentAssertions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.ImportExport.Domain.Events;

namespace NGO.PMS.ImportExport.Tests.Domain;

public class ImportJobTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _templateId = Guid.NewGuid();

    private ImportJob CreatePendingJob()
        => ImportJob.Create(_orgId, _userId, _templateId,
            "participants.csv", 51200, "/uploads/participants.csv",
            "Participants", "Participant");

    [Fact]
    public void Should_Create_ImportJob_As_Pending()
    {
        var job = CreatePendingJob();

        job.Should().NotBeNull();
        job.Id.Should().NotBeEmpty();
        job.OrganizationId.Should().Be(_orgId);
        job.ImportedById.Should().Be(_userId);
        job.ImportTemplateId.Should().Be(_templateId);
        job.FileName.Should().Be("participants.csv");
        job.FileSize.Should().Be(51200);
        job.FileStoragePath.Should().Be("/uploads/participants.csv");
        job.Module.Should().Be("Participants");
        job.EntityType.Should().Be("Participant");
        job.Status.Should().Be(ImportJobStatus.Pending);
        job.StartedAt.Should().BeNull();
        job.CompletedAt.Should().BeNull();

        job.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ImportJobCreatedEvent>()
            .Which.Module.Should().Be("Participants");
    }

    [Fact]
    public void Should_Start_Validation()
    {
        var job = CreatePendingJob();
        job.ClearDomainEvents();

        job.StartValidation();

        job.Status.Should().Be(ImportJobStatus.Validating);
    }

    [Fact]
    public void Should_Mark_Validated_With_RowCount()
    {
        var job = CreatePendingJob();
        job.StartValidation();

        job.MarkValidated(500);

        job.Status.Should().Be(ImportJobStatus.Validated);
        job.TotalRows.Should().Be(500);
    }

    [Fact]
    public void Should_Start_Processing()
    {
        var job = CreatePendingJob();
        job.StartValidation();
        job.MarkValidated(100);

        job.StartProcessing();

        job.Status.Should().Be(ImportJobStatus.Processing);
        job.StartedAt.Should().NotBeNull();
        job.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Should_Complete_Successfully()
    {
        var job = CreatePendingJob();
        job.StartValidation();
        job.MarkValidated(200);
        job.StartProcessing();
        job.RecordProgress(200, 200, 0);
        job.ClearDomainEvents();

        job.Complete();

        job.Status.Should().Be(ImportJobStatus.Completed);
        job.CompletedAt.Should().NotBeNull();
        job.ErrorLog.Should().BeNull();

        job.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ImportJobCompletedEvent>();
        var evt = (ImportJobCompletedEvent)job.DomainEvents.First();
        evt.SuccessRows.Should().Be(200);
        evt.ErrorRows.Should().Be(0);
    }

    [Fact]
    public void Should_Fail_With_ErrorLog()
    {
        var job = CreatePendingJob();
        job.StartValidation();

        job.Fail("Column 'Email' not found in source file.");

        job.Status.Should().Be(ImportJobStatus.Failed);
        job.ErrorLog.Should().Be("Column 'Email' not found in source file.");
        job.CompletedAt.Should().NotBeNull();
    }
}
