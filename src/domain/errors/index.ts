// Error Base
export * from './AppError';
export * from './DomainError';

// Domain Errors
export * from './UserNotFoundError';
export * from './UserNotFoundByEmailError';
export * from './EmailAlreadyExistsError';
export * from './InvalidCredentialsError';
export * from './UserAlreadyDeletedError';
export * from './UserNotDeletedError';
export * from './EmailAlreadyVerifiedError';
export * from './InvalidVerificationTokenError';
export * from './InvalidRoleError';
export * from './UserEmailAlreadyVerifiedError';
export * from './UserLoginBlockedError';

// Value Object Errors
export * from './InvalidEmailError';
export * from './InvalidIpAddressError';
export * from './InvalidUserIdError';
export * from './InvalidLoginAttemptIdError';
export * from './LoginAttemptFailedError';
export * from './InvalidHashError';
export * from './InvalidPasswordError';
export * from './HashError';
export * from './InvalidNameError';

// Auth Errors
export * from './auth/UnauthorizedError';
export * from './auth/ForbiddenError';
export * from './auth/TokenExpiredError';
export * from './auth/InvalidTokenError';
export * from './auth/MissingTokenError';
export * from './auth/RefreshTokenExpiredError';
export * from './auth/InvalidRefreshTokenError';