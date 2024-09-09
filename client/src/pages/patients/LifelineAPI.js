const SERVER_BASE_URL = '/api/v1'

export default class LifelineAPI {

  static async getHealthcareChoices(route, query) {
    if (route === 'hospital') {
      return this.getHospitals(query);
    } else if (route === 'physician') {
      return this.getPhysicians(query);
    }
  }

  static async getPhysicians(query) {
    const response = await fetch(`${SERVER_BASE_URL}/physicians?physician=${query}`);
    const data = await response.json();
    return data.map((item) => {
      return {
        ...item,
        name: `${item.firstName} ${item.lastName}`,
      };
    });
  }

  static async getHospitals(query) {
    const response = await fetch(`${SERVER_BASE_URL}/hospitals?hospital=${query}`);
    const data = await response.json();
    return data;
  }
}