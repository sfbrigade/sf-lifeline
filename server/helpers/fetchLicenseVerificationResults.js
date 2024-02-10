import LicenseMatchError from '../errors/LicenseErrors.js'

export default async function fetchLicenseVerificationResults(website, formData, sessionCookie) {
  const response = await fetch(website, {
    method: 'POST',
    body: formData,
    headers: {
      cookie: sessionCookie // Need a valid session cookie to search EMS website
    }
  })
  const html = await response.text()

  const regex = /<a[^>]*?>(.*?)<\/a><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span>/
  const match = html.match(regex) // Use the regex pattern to extract the first table row from the HTML

  if (match) {
    const [, name, licenseType, status, licenseNumber] = match
    const emsPersonnelInfo = { name, licenseType, status, licenseNumber }

    return emsPersonnelInfo
  } else {
    throw new LicenseMatchError('No match.')
  }
}
