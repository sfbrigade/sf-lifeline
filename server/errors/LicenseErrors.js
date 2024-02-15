export default class LicenseMatchError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'LicenseMatchError'
    this.statusCode = statusCode
  }
}
