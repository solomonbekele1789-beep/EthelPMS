using System.Text.Json;
using System.Text.Json.Serialization;

namespace NGO.PMS.SharedKernel.Api;

/// <summary>
/// Allows deserializing Guids from standard Guid strings or known currency codes.
/// </summary>
public class FlexibleGuidJsonConverter : JsonConverter<Guid>
{
    private static readonly Dictionary<string, Guid> WellKnownCurrencies = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ETB"] = Guid.Parse("11111111-1111-1111-1111-111111111111"),
        ["USD"] = Guid.Parse("22222222-2222-2222-2222-222222222222"),
        ["EUR"] = Guid.Parse("33333333-3333-3333-3333-333333333333"),
        ["GBP"] = Guid.Parse("44444444-4444-4444-4444-444444444444"),
        ["KES"] = Guid.Parse("55555555-5555-5555-5555-555555555555"),
    };

    public static readonly Guid DefaultCurrencyId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return DefaultCurrencyId;

            if (Guid.TryParse(str, out var guid))
                return guid == Guid.Empty ? DefaultCurrencyId : guid;

            if (WellKnownCurrencies.TryGetValue(str.Trim(), out var mapped))
                return mapped;

            return DefaultCurrencyId;
        }

        return DefaultCurrencyId;
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

/// <summary>
/// Allows deserializing nullable Guids, converting empty strings or invalid strings to null.
/// </summary>
public class NullableGuidJsonConverter : JsonConverter<Guid?>
{
    public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return null;

            if (Guid.TryParse(str, out var guid))
                return guid;

            return null;
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value);
        else
            writer.WriteNullValue();
    }
}
