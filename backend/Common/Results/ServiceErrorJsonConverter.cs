using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Common.Results;

public class ServiceErrorJsonConverter : JsonConverter<ServiceError>
{
    public override ServiceError Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // We don't need to deserialize ServiceError from JSON in our API
        // This is only for serialization (API responses)
        throw new NotImplementedException("ServiceError deserialization is not supported");
    }

    public override void Write(Utf8JsonWriter writer, ServiceError value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();

        // Core properties that are always present
        writer.WriteString("errorCode", value.ErrorCode);
        writer.WriteString("message", value.Message);
        writer.WriteNumber("statusCode", value.StatusCode);

        // Serialize Category enum as string manually
        writer.WriteString("category", value.Category.ToString());

        // NEW: Include field errors only if present (validation errors)
        if (value.HasFieldErrors)
        {
            writer.WritePropertyName("errors");
            JsonSerializer.Serialize(writer, value.Errors, options);
        }

        writer.WriteEndObject();
    }
}
