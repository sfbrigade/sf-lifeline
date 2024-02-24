/**
 * Generates the necessary sessionCookie and formData object required to make a
 * POST request to California's EMS personnel registry website
 * 
 * @param {string} website California's EMS personnel registry website
 * @param {string} license an EMS personnel's license
 * @returns a Promise, once resolved, containing a sessionCookie string and formData object 
 *  necessary to make a POST request on the registry website
 */

export default async function fetchLicenseVerificationForm(website, license) {
  const formData = new FormData();
  formData.append('t_web_lookup__license_no', license);

  const response = await fetch(website, {
    method: 'GET'
  });
  const sessionCookie = response.headers.get('set-cookie').split(';')[0];

  const html = await response.text(); // Need to await converting the fetch response into HTML

  const viewstateRegex = /<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)" \/>/;
  const eventValidationRegex = /<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)" \/>/;

  const viewstateMatch = html.match(viewstateRegex);
  const eventValidationMatch = html.match(eventValidationRegex);

  const viewStateValue = viewstateMatch[1];
  const eventValidationValue = eventValidationMatch[1];

  formData.append('__VIEWSTATE', viewStateValue);
  formData.append('__EVENTVALIDATION', eventValidationValue);

  formData.append('sch_button', 'Search');
  return { sessionCookie, formData };
}
