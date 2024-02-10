import LicenseMatchError from '../errors/LicenseErrors.js';

/**
 * Makes a POST request to California's EMS personnel registry website
 * 
 * @param {string} website California's EMS personnel registry website
 * @param {object} formData the necessary form data required to make a POST request for the registry website
 * @param {string} sessionCookie a valid session cookie to authenticate the POST request
 * @returns personnel info that matches the license number from the formData
 * @throws a LicenseMatchError if there are not matching personnels
 */
export default async function fetchLicenseVerificationResults(website, formData, sessionCookie) {
  const response = await fetch(website, {
    method: 'POST',
    body: formData,
    headers: {
      cookie: sessionCookie // Need a valid session cookie to search EMS website
    }
  });
  const html = await response.text();

  const regex = /<a[^>]*?>(.*?)<\/a><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span>/;
  const match = html.match(regex); // Use the regex pattern to extract the first table row from the HTML

  if (match) {
    const [, name, licenseType, status, licenseNumber] = match;
    const emsPersonnelInfo = { name, licenseType, status, licenseNumber };

    return emsPersonnelInfo;
  } else {
    throw new LicenseMatchError('No match.');
  }
}
