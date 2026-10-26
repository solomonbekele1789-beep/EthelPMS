using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Identity.Domain.Events;

namespace NGO.PMS.Identity.Domain.Entities;

public class User : AuditableEntity, ISoftDeletable
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool EmailConfirmed { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTimeOffset? LockoutEnd { get; private set; }
    public Guid? OfficeId { get; private set; }
    public Guid OrganizationId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<UserRole> UserRoles { get; private set; } = [];
    public Office? Office { get; private set; }

    public string FullName => $"{FirstName} {LastName}";

    public static User Create(string email, string firstName, string lastName, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("First name is required.", nameof(firstName));

        var user = new User
        {
            Email = email.ToLowerInvariant().Trim(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            OrganizationId = orgId
        };
        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Email));
        return user;
    }

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        EmailConfirmed = true;
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= 5)
            LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(15);
    }

    public void RecordSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockoutEnd = null;
    }

    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd > DateTimeOffset.UtcNow;

    public void Deactivate()
    {
        IsActive = false;
        AddDomainEvent(new UserDeactivatedEvent(Id));
    }

    public void Activate() => IsActive = true;

    public void UpdateProfile(string firstName, string lastName, string? phone, Guid? officeId)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Phone = phone;
        OfficeId = officeId;
    }
}
