"use strict"

const EMS_VERIFICATION_WEBSITE = "https://emsverification.emsa.ca.gov/Verification/Search.aspx";

/**
 * Search for an EMS personnel on California's EMS Verification website
 * 
 * @param {string} license - an EMS personnel's license
 * @returns {object} EMS personnel information which includes name, licenseType, status, and licenseNumber
 * @throws An error if the EMS verification website has issues or if there is no match for the licesnse
 */
export default async function verifyLicense(license) {
  const formData = new FormData()
  formData.append("t_web_lookup__license_no", license);

  let sessionCookie = undefined;

  try {
    const response = await fetch(EMS_VERIFICATION_WEBSITE, {
      method: "GET"
    });
    sessionCookie = response.headers.get("set-cookie").split(";")[0];

    const html = await response.text() // Need to await converting the fetch response into HTML

    const viewstateRegex = /<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)" \/>/;
    const eventValidationRegex = /<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)" \/>/;

    const viewstateMatch = html.match(viewstateRegex);
    const eventValidationMatch = html.match(eventValidationRegex);

    const viewStateValue = viewstateMatch[1];
    const eventValidationValue = eventValidationMatch[1];

    formData.append("__VIEWSTATE", viewStateValue);
    formData.append("__EVENTVALIDATION", eventValidationValue);

    formData.append("sch_button", "Search");

  } catch (e) {
    console.error(e);
    throw new Error("Unable to access verification website, try again later.");
  }

  if (sessionCookie) {
    try {
      const response = await fetch(EMS_VERIFICATION_WEBSITE, {
        method: "POST",
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
        throw new Error("No match.");
      }
    } catch (e) {
      console.error(e);
      throw new Error("Unable to access verification results, try again later.");
    }
  }
};
