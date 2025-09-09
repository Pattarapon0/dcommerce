# Use the official .NET 9 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the official .NET 9 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["server.csproj", "."]
RUN dotnet restore "./server.csproj"

# Copy all source code
COPY . .
WORKDIR "/src/."

# Build the application
RUN dotnet build "server.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set default port (Railway will override with $PORT)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Create startup script to handle Railway's dynamic PORT
RUN echo '#!/bin/sh\nif [ ! -z "$PORT" ]; then\n  export ASPNETCORE_URLS="http://+:$PORT"\nfi\nexec dotnet server.dll' > /app/start.sh && chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]