using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using backend.Common.Models;
using backend.Common.Services.Auth;
using backend.Controllers.Common;

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
    public Task<IActionResult> Register([FromBody] RegisterRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.RegisterAsync(request));

    /// <summary>
    /// Verify user email address using verification token
    /// </summary>
    /// <param name="request">Email verification token</param>
    /// <returns>Verification result with updated user profile</returns>
    [HttpPost("verify-email")]
    public Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        => ValidateAndExecuteAsync(request, () => _authService.VerifyEmailAsync(request));
}
