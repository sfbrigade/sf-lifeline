const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  static async getHospitals (query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals?hospital=${query}&page=${page}`
    );
    return response;
  }

  static async getHospital (id) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals/${id}`
    );
    return response;
  }

  static async createHospital (data) {
    const response = await fetch(`${SERVER_BASE_URL}/hospitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  }

  static async updateHospital (data, hospitalId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals/${hospitalId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response;
  }

  static async deleteHospital (hospitalId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals/${hospitalId}`,
      {
        method: 'DELETE',
      }
    );
    return response;
  }
}
