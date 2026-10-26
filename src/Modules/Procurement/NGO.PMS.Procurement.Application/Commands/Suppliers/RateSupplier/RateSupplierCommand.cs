using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.Suppliers.RateSupplier;

public sealed record RateSupplierCommand(Guid SupplierId, decimal Score) : IRequest<Unit>;
