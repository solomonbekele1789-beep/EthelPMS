using FluentAssertions;
using NGO.PMS.Participants.Domain.Entities;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;

namespace NGO.PMS.Participants.Tests.Domain;

public class ParticipantTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    private Participant CreateActiveParticipant()
        => Participant.Create("Abebe", "Bekele", Gender.Male, "ETHEL-P-000001", _orgId);

    [Fact]
    public void Create_ValidInput_SetsProperties()
    {
        var participant = CreateActiveParticipant();

        participant.FirstName.Should().Be("Abebe");
        participant.LastName.Should().Be("Bekele");
        participant.FullName.Should().Be("Abebe Bekele");
        participant.Gender.Should().Be(Gender.Male);
        participant.Status.Should().Be(ParticipantStatus.Active);
        participant.ParticipantCode.Should().Be("ETHEL-P-000001");
        participant.OrganizationId.Should().Be(_orgId);
        participant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ParticipantRegisteredEvent>();
    }

    [Fact]
    public void Create_EmptyFirstName_ThrowsArgumentException()
    {
        var act = () => Participant.Create("", "Bekele", Gender.Male, "ETHEL-P-000001", _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*First name*");
    }

    [Fact]
    public void Create_EmptyLastName_ThrowsArgumentException()
    {
        var act = () => Participant.Create("Abebe", "", Gender.Male, "ETHEL-P-000001", _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*Last name*");
    }

    [Fact]
    public void UpdateProfile_ChangesName()
    {
        var participant = CreateActiveParticipant();

        participant.UpdateProfile("Kebede", "Tadesse", null,
            Gender.Male, null, null, null, null);

        participant.FullName.Should().Be("Kebede Tadesse");
        participant.FirstName.Should().Be("Kebede");
        participant.LastName.Should().Be("Tadesse");
    }

    [Fact]
    public void Deactivate_ActiveParticipant_SetsInactive()
    {
        var participant = CreateActiveParticipant();

        participant.Deactivate();

        participant.Status.Should().Be(ParticipantStatus.Inactive);
    }

    [Fact]
    public void Deactivate_GraduatedParticipant_ThrowsInvalidOperationException()
    {
        var participant = CreateActiveParticipant();

        // Use reflection to set Status to Graduated (MarkGraduated is internal)
        var statusProp = typeof(Participant).GetProperty(nameof(Participant.Status));
        statusProp!.SetValue(participant, ParticipantStatus.Graduated);

        var act = () => participant.Deactivate();
        act.Should().Throw<InvalidOperationException>().WithMessage("*graduated*");
    }

    [Fact]
    public void MarkExited_ActiveParticipant_SetsExited()
    {
        var participant = CreateActiveParticipant();

        participant.MarkExited();

        participant.Status.Should().Be(ParticipantStatus.Exited);
    }

    [Fact]
    public void SetVulnerabilityScore_NegativeScore_ThrowsArgumentException()
    {
        var participant = CreateActiveParticipant();

        var act = () => participant.SetVulnerabilityScore(-1m);
        act.Should().Throw<ArgumentException>().WithMessage("*negative*");
    }
}
