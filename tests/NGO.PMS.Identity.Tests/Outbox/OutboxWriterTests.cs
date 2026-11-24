using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Contracts.IntegrationEvents.Identity;
using NGO.PMS.Identity.Tests.Helpers;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Identity.Tests.Outbox;

public class OutboxWriterTests
{
    [Fact]
    public async Task WriteAsync_ShouldPersistOutboxMessage_WithEventIdAndOrganizationId()
    {
        var orgId = Guid.NewGuid();
        using var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);
        var writer = new OutboxWriter(db);
        var userId = Guid.NewGuid();

        var evt = new UserCreatedIntegrationEvent
        {
            UserId = userId,
            Email = "user@ngo.org",
            FirstName = "Test",
            LastName = "User",
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
