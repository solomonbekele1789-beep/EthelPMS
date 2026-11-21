using Microsoft.EntityFrameworkCore.Diagnostics;

namespace NGO.PMS.SharedKernel.Audit;

/// <summary>
/// Marker interface allowing module DbContexts to attach the Host's AuditSaveChangesInterceptor
/// without violating Clean Architecture (modules never reference Host).
/// </summary>
public interface IAuditInterceptor : IInterceptor;
