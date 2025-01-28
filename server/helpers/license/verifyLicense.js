import fetchLicenseVerificationForm from './fetchLicenseVerificationForm.js';
import fetchLicenseVerificationResults from './fetchLicenseVerificationResults.js';
import {
  LicenseMatchError,
  LicenseWebsiteError,
} from '../../errors/LicenseErrors.js';

export const EMS_VERIFICATION_WEBSITE_BASE_URL =
  'https://emsverification.emsa.ca.gov';
export const EMS_VERIFICATION_WEBSITE_PATH = '/Verification/Search.aspx';
export const EMS_VERIFICATION_WEBSITE = `${EMS_VERIFICATION_WEBSITE_BASE_URL}${EMS_VERIFICATION_WEBSITE_PATH}`;

/**
 * Search for an EMS personnel on California's EMS personnel registry website
 *
 * @param {string} license an EMS personnel's license
 * @returns {object} EMS personnel information which includes name, licenseType, status, and licenseNumber
 * @throws An error if the EMS verification website has issues or if there is no match for the licesnse
 */
export default async function verifyLicense (license) {
  let formData;
  let sessionCookie;

  try {
    const res = await fetchLicenseVerificationForm(
      EMS_VERIFICATION_WEBSITE,
      license
    );

    formData = res.formData;
    sessionCookie = res.sessionCookie;
  } catch (err) {
    console.error(err);
    throw new LicenseWebsiteError(
      503,
      'Unable to access verification website, try again later.'
    );
  }

  if (sessionCookie) {
    try {
      const emsPersonnelInfo = await fetchLicenseVerificationResults(
        EMS_VERIFICATION_WEBSITE,
        formData,
        sessionCookie
      );
      return emsPersonnelInfo;
    } catch (err) {
      if (err instanceof LicenseMatchError) {
        throw err;
      }
      console.error(err);
      throw new LicenseWebsiteError(
        503,
        'Unable to access verification results, try again later.'
      );
    }
  }
}
