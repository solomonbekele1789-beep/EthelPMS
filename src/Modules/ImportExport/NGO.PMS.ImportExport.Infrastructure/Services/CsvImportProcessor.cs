using NGO.PMS.ImportExport.Domain.Abstractions;

namespace NGO.PMS.ImportExport.Infrastructure.Services;

/// <summary>
/// CSV-based import processor. Validates and processes uploaded CSV/Excel files.
/// In production, integrate with CsvHelper or EPPlus for robust parsing.
/// </summary>
public sealed class CsvImportProcessor : IImportProcessor
{
    public Task<ImportValidationResult> ValidateAsync(
        Stream fileStream, string columnMappings, string? validationRules, CancellationToken ct = default)
    {
        // TODO: Implement real CSV/Excel validation with CsvHelper or EPPlus
        var result = new ImportValidationResult(TotalRows: 0, IsValid: true, Errors: []);
        return Task.FromResult(result);
    }

    public Task<ImportProcessResult> ProcessAsync(
        Stream fileStream, string columnMappings, string module, string entityType, CancellationToken ct = default)
    {
        // TODO: Implement real CSV/Excel import processing
        var result = new ImportProcessResult(Processed: 0, Succeeded: 0, Failed: 0, Errors: []);
        return Task.FromResult(result);
    }
}
