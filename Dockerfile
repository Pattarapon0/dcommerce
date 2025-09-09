# Use the official .NET 9 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory
WORKDIR /app

# Copy csproj and restore dependencies
COPY backend/*.csproj ./
RUN dotnet restore

# Copy the rest of the application code
COPY backend/ ./

# Build the application
RUN dotnet publish -c Release -o out --no-restore

# Use the official .NET 9 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Set working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/out .

# Create a non-root user for security
RUN addgroup --system --gid 1001 dotnetgroup && \
    adduser --system --uid 1001 --ingroup dotnetgroup dotnetuser

# Change ownership of the app directory
RUN chown -R dotnetuser:dotnetgroup /app

# Switch to non-root user
USER dotnetuser

# Expose the port that the application will run on
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Define the entry point
ENTRYPOINT ["dotnet", "server.dll"]