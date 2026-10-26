using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;

public record ToggleModuleCommand(
    Guid TenantId,
    string ModuleName,
    bool Enabled) : IRequest;
