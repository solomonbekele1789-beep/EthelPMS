namespace NGO.PMS.Partnerships.Application.DTOs;

public class DisbursementDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid SubGranteeId { get; set; }
    public Guid? GrantId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime DisbursementDate { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
