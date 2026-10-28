using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.CreateSupplier;

public sealed record CreateSupplierCommand(
    string Name,
    string ContactPerson,
    string Email,
    string? Phone,
    string? Address,
    string? TaxIdNumber) : IRequest<Guid>;
