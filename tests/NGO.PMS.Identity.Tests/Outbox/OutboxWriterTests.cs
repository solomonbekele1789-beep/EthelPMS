using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Contracts.IntegrationEvents.Identity;
using NGO.PMS.Identity.Tests.Helpers;
using NGO.PMS.SharedKernel.Outbox;
using Xunit;

namespace NGO.PMS.Identity.Tests.Outbox;

public class OutboxWriterTests
{
    [Fact]
    public async Task WriteAsync_ShouldPersistOutboxMessage_WithEventIdAndOrganizationId()
    {
        using var db = IdentityTestFixture.CreateDbContext();
        var writer = new OutboxWriter(db);
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var evt = new UserCreatedIntegrationEvent(userId, "user@ngo.org", "Test User", orgId)
        {
            OrganizationId = orgId
        };

        await writer.WriteAsync(evt, CancellationToken.None);
        await db.SaveChangesAsync();

        var stored = await db.OutboxMessages.SingleAsync();
        stored.Id.Should().Be(evt.EventId);
        stored.OrganizationId.Should().Be(orgId);
        stored.EventType.Should().Contain(nameof(UserCreatedIntegrationEvent));
        stored.Payload.Should().Contain("user@ngo.org");
        stored.ProcessedAt.Should().BeNull();
        stored.IsDeadLetter.Should().BeFalse();
    }
}
