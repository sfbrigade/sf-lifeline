export class LicenseMatchError extends Error {
  constructor (statusCode, message) {
    super(message);
    this.name = 'LicenseMatchError';
    this.statusCode = statusCode;
  }
}

export class LicenseWebsiteError extends Error {
  constructor (statusCode, message) {
    super(message);
    this.name = 'LicenseWebsiteError';
    this.statusCode = statusCode;
  }
}
