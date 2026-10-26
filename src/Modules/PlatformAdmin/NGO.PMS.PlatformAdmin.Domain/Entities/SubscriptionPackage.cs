using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class SubscriptionPackage : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public int MaxUsers { get; private set; }
    public int MaxProjects { get; private set; }
    public string[] IncludedModules { get; private set; } = [];
    public decimal PriceMonthlyUsd { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static SubscriptionPackage Create(string name, int maxUsers, int maxProjects, string[] modules, decimal price)
    {
        return new SubscriptionPackage
        {
            Name = name, MaxUsers = maxUsers, MaxProjects = maxProjects,
            IncludedModules = modules, PriceMonthlyUsd = price
        };
    }
}
