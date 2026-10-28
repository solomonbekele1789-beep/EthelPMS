using MediatR;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenantBranding;

public record UpdateTenantBrandingCommand(
    Guid TenantId,
    string? LogoUrl,
    string? PrimaryColor) : IRequest;
