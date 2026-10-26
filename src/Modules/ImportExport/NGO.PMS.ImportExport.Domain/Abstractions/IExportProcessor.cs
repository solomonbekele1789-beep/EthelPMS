namespace NGO.PMS.ImportExport.Domain.Abstractions;

public interface IExportProcessor
{
    Task<Stream> ExportAsync(string module, string entityType, string format, string? filterCriteria, CancellationToken ct = default);
}
