using NGO.PMS.Documents.Application.Abstractions;

namespace NGO.PMS.Documents.Infrastructure.Services;

/// <summary>
/// Local filesystem-based file storage implementation.
/// In production, replace with Supabase Storage, Azure Blob, or S3.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public LocalFileStorageService()
    {
        _basePath = Path.Combine(AppContext.BaseDirectory, "storage", "documents");
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        var uniqueName = $"{Guid.NewGuid():N}_{fileName}";
        var filePath = Path.Combine(_basePath, uniqueName);
        await using var fileStream = File.Create(filePath);
        await stream.CopyToAsync(fileStream, ct);
        return $"local://{uniqueName}";
    }

    public Task<Stream> DownloadAsync(string storageUrl, CancellationToken ct)
    {
        var fileName = storageUrl.Replace("local://", string.Empty);
        var filePath = Path.Combine(_basePath, fileName);

        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File not found: {fileName}");

        Stream stream = File.OpenRead(filePath);
        return Task.FromResult(stream);
    }
}
