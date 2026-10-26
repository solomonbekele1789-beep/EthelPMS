using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class DonorCommunication : AuditableEntity, IMultiTenant
{
    public Guid DonorId { get; private set; }
    public Guid? GrantId { get; private set; }
    public CommunicationType Type { get; private set; }
    public string Subject { get; private set; } = string.Empty;
    public string? Content { get; private set; }
    public DateTime CommunicationDate { get; private set; }
    public string ContactedBy { get; private set; } = string.Empty;
    public string? Outcome { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private DonorCommunication() { }

    public static DonorCommunication Create(Guid donorId, Guid? grantId, CommunicationType type,
        string subject, string? content, DateTime communicationDate, string contactedBy, string? outcome)
    {
        if (donorId == Guid.Empty)
            throw new ArgumentException("Donor ID is required.", nameof(donorId));
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject is required.", nameof(subject));
        if (string.IsNullOrWhiteSpace(contactedBy))
            throw new ArgumentException("ContactedBy is required.", nameof(contactedBy));

        return new DonorCommunication
        {
            DonorId = donorId,
            GrantId = grantId,
            Type = type,
            Subject = subject,
            Content = content,
            CommunicationDate = communicationDate,
            ContactedBy = contactedBy,
            Outcome = outcome
        };
    }
}
