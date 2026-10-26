using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.BlacklistSupplier;

public sealed record BlacklistSupplierCommand(Guid SupplierId, string Reason) : IRequest<Unit>;
