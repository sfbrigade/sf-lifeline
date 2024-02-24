import { LicenseMatchError } from '../errors/LicenseErrors.js';

/**
 * Makes a POST request to California's EMS personnel registry website
 * 
 * @param {string} website California's EMS personnel registry website
 * @param {object} formData the necessary form data required to make a POST request for the registry website
 * @param {string} sessionCookie a valid session cookie to authenticate the POST request
 * @returns personnel info that matches the license number from the formData
 * @throws a LicenseMatchError if there are not matching personnels or an Error if there were issues accessing the registry
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

  const personnelResultsRegex = /<a[^>]*?>(.*?)<\/a><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span><\/td><td><span>(.*?)<\/span>/;
  const noResultsRegex = /<table[^>]*id="datagrid_results"[^>]*>\s*(?!.*?datagrid_results__ctl3_result).*?<\/table>/s;

  const matchingPersonnel = html.match(personnelResultsRegex); // Use the personnelResultsRegex pattern to extract the first table row from the HTML
  const noResults = html.match(noResultsRegex) // Use the noResultsRegex to determine if there are no personnel in results table

  if (matchingPersonnel) {
    const [, name, licenseType, status, licenseNumber] = matchingPersonnel;
    const emsPersonnelInfo = { name, licenseType, status, licenseNumber };
    return emsPersonnelInfo;
  } else if (noResults && !matchingPersonnel) {
    throw new LicenseMatchError(404, 'No match.');
  } else {
    throw new Error;
  }
}