using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Core participant profile with comprehensive demographics per REQ-PART-001/003.
/// Auto-generated participant code per REQ-PART-002.
/// </summary>
public class Participant : AuditableEntity, ISoftDeletable
{
    public string FirstName { get; private set; } = string.Empty;
    public string? MiddleName { get; private set; }
    public string LastName { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;

    /// <summary>
    /// Auto-generated code: ETHEL-P-NNNNNN per REQ-PART-002.
    /// </summary>
    public string ParticipantCode { get; private set; } = string.Empty;

    public Gender Gender { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public string? IdNumber { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public ParticipantStatus Status { get; private set; } = ParticipantStatus.Active;
    public DateTimeOffset RegistrationDate { get; private set; }

    // Address
    public string? Region { get; private set; }
    public string? Zone { get; private set; }
    public string? Woreda { get; private set; }
    public string? Kebele { get; private set; }
    public string? Address { get; private set; }

    // Vulnerability scoring (REQ-PART-008)
    public decimal? VulnerabilityScore { get; private set; }

    // Household linkage (REQ-PART-004)
    public Guid? HouseholdId { get; private set; }

    // Photo
    public string? PhotoUrl { get; private set; }

    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<ParticipantEnrollment> Enrollments { get; private set; } = [];
    public ICollection<GraduationAssessment> GraduationAssessments { get; private set; } = [];

    /// <summary>
    /// Computed age from DateOfBirth.
    /// </summary>
    public int? Age => DateOfBirth.HasValue
        ? (int)((DateTime.Today - DateOfBirth.Value.ToDateTime(TimeOnly.MinValue)).TotalDays / 365.25)
        : null;

    public static Participant Create(
        string firstName, string lastName, Gender gender,
        string participantCode, Guid orgId,
        string? middleName = null, DateOnly? dateOfBirth = null,
        string? idNumber = null, string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.", nameof(lastName));

        var fullName = string.IsNullOrWhiteSpace(middleName)
            ? $"{firstName.Trim()} {lastName.Trim()}"
            : $"{firstName.Trim()} {middleName.Trim()} {lastName.Trim()}";

        var participant = new Participant
        {
            FirstName = firstName.Trim(),
            MiddleName = middleName?.Trim(),
            LastName = lastName.Trim(),
            FullName = fullName,
            ParticipantCode = participantCode,
            Gender = gender,
            DateOfBirth = dateOfBirth,
            IdNumber = idNumber,
            Phone = phone,
            RegistrationDate = DateTimeOffset.UtcNow,
            OrganizationId = orgId
        };
        participant.AddDomainEvent(new ParticipantRegisteredEvent(participant.Id, fullName));
        return participant;
    }

    public void UpdateProfile(string firstName, string lastName, string? middleName,
        Gender gender, DateOnly? dateOfBirth, string? phone, string? email, string? idNumber)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        MiddleName = middleName?.Trim();
        FullName = string.IsNullOrWhiteSpace(middleName)
            ? $"{firstName.Trim()} {lastName.Trim()}"
            : $"{firstName.Trim()} {middleName.Trim()} {lastName.Trim()}";
        Gender = gender;
        DateOfBirth = dateOfBirth;
        Phone = phone;
        Email = email;
        IdNumber = idNumber;
    }

    public void UpdateAddress(string? region, string? zone, string? woreda,
        string? kebele, string? address)
    {
        Region = region;
        Zone = zone;
        Woreda = woreda;
        Kebele = kebele;
        Address = address;
    }

    public void SetVulnerabilityScore(decimal score)
    {
        if (score < 0)
            throw new ArgumentException("Vulnerability score cannot be negative.", nameof(score));
        VulnerabilityScore = score;
    }

    public void LinkToHousehold(Guid? householdId)
    {
        HouseholdId = householdId;
    }

    public void SetPhoto(string? photoUrl)
    {
        PhotoUrl = photoUrl;
    }

    public void Deactivate()
    {
        if (Status == ParticipantStatus.Graduated)
            throw new InvalidOperationException("Cannot deactivate a graduated participant.");
        Status = ParticipantStatus.Inactive;
    }

    public void Activate()
    {
        if (Status == ParticipantStatus.Graduated)
            throw new InvalidOperationException("Cannot reactivate a graduated participant.");
        Status = ParticipantStatus.Active;
    }

    public void MarkExited()
    {
        if (Status == ParticipantStatus.Graduated)
            throw new InvalidOperationException("Cannot exit a graduated participant.");
        Status = ParticipantStatus.Exited;
    }

    /// <summary>
    /// Called internally when graduation is approved. Irreversible per REQ-GRAD-005.
    /// </summary>
    internal void MarkGraduated()
    {
        Status = ParticipantStatus.Graduated;
    }
}
