export default class LicenseMatchError extends Error {
  constructor (message) {
    super(message)
    this.name = 'LicenseMatchError'
  }
}
