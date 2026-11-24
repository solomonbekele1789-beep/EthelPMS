using System.Reflection;
using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Loader;
using ArchUnitNET.xUnit;
using Xunit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace NGO.PMS.Architecture.Tests;

/// <summary>
/// Architecture fitness tests enforcing Clean Architecture and modular monolith boundaries
/// per docs/plans/00-CODING-STANDARDS.md and docs/plans/backend/BACKEND-OVERVIEW.md.
/// </summary>
public class ModuleDependencyTests
{
    private static readonly string[] Modules =
    [
        "Identity", "PlatformAdmin", "Projects", "Planning", "Reporting",
        "MEAL", "Participants", "Procurement", "FundAccounting", "Assets",
        "Training", "Tasks", "Risk", "Donors", "Chat", "Notifications",
        "Documents", "Feedback", "Dashboards", "Settings", "KnowledgeMgmt",
        "Partnerships", "SystemReports", "ImportExport"
    ];

    private static readonly ArchUnitNET.Domain.Architecture Architecture = new ArchLoader()
        .LoadAssemblies(LoadSolutionAssemblies())
        .Build();

    private static System.Reflection.Assembly[] LoadSolutionAssemblies()
    {
        var baseDir = AppContext.BaseDirectory;
        var dlls = Directory.GetFiles(baseDir, "NGO.PMS.*.dll");
        var loaded = new List<System.Reflection.Assembly>();
        foreach (var dll in dlls)
        {
            try
            {
                loaded.Add(System.Reflection.Assembly.LoadFrom(dll));
            }
            catch
            {
                // Ignore non-loadable native/satellite assemblies
            }
        }
        return loaded.ToArray();
    }

    [Fact]
    public void DomainLayer_ShouldNotDependOn_ApplicationInfrastructureOrApi()
    {
        var domainTypes = Types().That().ResideInNamespace(@"^NGO\.PMS\.[^.]+\.Domain", useRegularExpressions: true);
        var forbiddenTypes = Types().That().ResideInNamespace(@"^NGO\.PMS\.[^.]+\.(Application|Infrastructure|API)", useRegularExpressions: true);

        IArchRule rule = domainTypes
            .Should().NotDependOnAny(forbiddenTypes)
            .Because("Domain layer must remain pure and only depend on SharedKernel.");

        rule.Check(Architecture);
    }

    [Fact]
    public void ApplicationLayer_ShouldNotDependOn_InfrastructureOrApi()
    {
        var appTypes = Types().That().ResideInNamespace(@"^NGO\.PMS\.[^.]+\.Application", useRegularExpressions: true);
        var forbiddenTypes = Types().That().ResideInNamespace(@"^NGO\.PMS\.[^.]+\.(Infrastructure|API)", useRegularExpressions: true);

        IArchRule rule = appTypes
            .Should().NotDependOnAny(forbiddenTypes)
            .Because("Application layer may only depend on Domain, SharedKernel, and Contracts.");

        rule.Check(Architecture);
    }

    [Theory]
    [MemberData(nameof(GetModuleNames))]
    public void Module_ShouldNotDirectlyDependOn_OtherModules(string moduleName)
    {
        var thisModule = Types().That()
            .ResideInNamespace($@"^NGO\.PMS\.{moduleName}\.", useRegularExpressions: true);

        var otherModules = Types().That()
            .ResideInNamespace(@"^NGO\.PMS\.(?!(SharedKernel|Contracts|" + moduleName + @"))[^.]+\.(Domain|Application|Infrastructure|API)", useRegularExpressions: true);

        IArchRule rule = thisModule
            .Should().NotDependOnAny(otherModules)
            .Because($"Module {moduleName} must communicate with other modules only via NGO.PMS.Contracts integration events.");

        rule.Check(Architecture);
    }

    public static IEnumerable<object[]> GetModuleNames() =>
        Modules.Select(m => new object[] { m });
}
