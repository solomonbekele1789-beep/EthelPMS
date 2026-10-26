using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.UpdateSupplier;

public sealed record UpdateSupplierCommand(
    Guid Id,
    string Name,
    string ContactPerson,
    string Email,
    string? Phone,
    string? Address,
    string? TaxIdNumber) : IRequest<Unit>;
