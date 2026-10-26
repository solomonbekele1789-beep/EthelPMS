using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class FundCode : AuditableEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public FundType FundType { get; private set; }
    public string? Description { get; private set; }
    public Guid? DonorGrantId { get; private set; }
    public bool IsActive { get; private set; }
    public Guid OrganizationId { get; set; }

    private FundCode() { }

    public static FundCode Create(
        string code,
        string name,
        FundType fundType,
        Guid orgId)
    {
        var fundCode = new FundCode
        {
            Code = code,
            Name = name,
            FundType = fundType,
            IsActive = true,
            OrganizationId = orgId
        };

        return fundCode;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void LinkToDonorGrant(Guid grantId)
    {
        DonorGrantId = grantId;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
