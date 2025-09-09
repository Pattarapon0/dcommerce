using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using backend.Common.Models;
using backend.Common.Services.Auth;
using backend.Controllers.Common;
using backend.Common.Results;
namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController(IAuthService authService) : BaseController
{
    private readonly IAuthService _authService = authService;

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">User registration information</param>
    /// <returns>Registration result with user profile information</returns>
    [HttpPost("register")]
    [ProducesResponseType<ServiceSuccess<RegisterResponse>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(409)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> Register([FromBody] RegisterRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.RegisterAsync(request));
    /// <summary>
    /// Verify user email address using verification token
    /// </summary>
    /// <param name="request">Email verification token</param>
    /// <returns>Verification result with updated user profile</returns>
    [HttpPost("verify-email")]
    [ProducesResponseType<ServiceSuccess<VerifyEmailResponse>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.VerifyEmailAsync(request));   
    
    /// <summary>
    /// Login a user
    /// </summary>
    /// <param name="request">User login information</param>
    /// <returns>Login result with access and refresh tokens</returns>
    [HttpPost("login")]
    [ProducesResponseType<ServiceSuccess<LoginResponse>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> Login([FromBody] LoginRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.LoginAsync(request));

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <returns>New access and refresh tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType<ServiceSuccess<LoginResponse>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> RefreshToken([FromBody] RefreshTokenRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.RefreshTokenAsync(request));

    /// <summary>
    /// Handle Google OAuth PKCE callback from frontend
    /// </summary>
    /// <param name="request">PKCE callback request with code and code verifier</param>
    /// <returns>Login response with JWT tokens</returns>
    [HttpPost("google/pkce")]
    [ProducesResponseType<ServiceSuccess<LoginResponse>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> GooglePkceCallback([FromBody] PkceCallbackRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.HandlePkceCallbackAsync(request));
}
