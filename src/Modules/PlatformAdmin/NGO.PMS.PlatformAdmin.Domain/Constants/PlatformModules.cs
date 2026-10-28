namespace NGO.PMS.PlatformAdmin.Domain.Constants;

public static class PlatformModules
{
    public static readonly IReadOnlyList<string> All =
    [
        "identity", "projects", "results-framework", "planning",
        "reporting", "meal", "participants", "graduation",
        "procurement", "fund-accounting", "assets", "training",
        "tasks", "risk", "donors", "chat", "notifications", "documents"
    ];

    public static readonly IReadOnlyDictionary<string, string[]> TierDefaults =
        new Dictionary<string, string[]>
        {
            ["Free"] = ["identity", "projects", "reporting"],
            ["Pro"] = ["identity", "projects", "results-framework", "planning", "reporting", "meal", "participants", "tasks", "notifications"],
            ["Enterprise"] = [.. All]
        };

    public static bool IsValid(string moduleName) => All.Contains(moduleName);
}
