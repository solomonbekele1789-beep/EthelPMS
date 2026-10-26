namespace NGO.PMS.Assets.Application.DTOs;

public class AssetDisposalDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string DisposalMethod { get; set; } = string.Empty;
    public decimal? DisposalValue { get; set; }
    public decimal BookValueAtDisposal { get; set; }
    public DateTime? DisposalDate { get; set; }
    public bool RequiresDonorApproval { get; set; }
    public string? DonorApprovalReference { get; set; }
}
