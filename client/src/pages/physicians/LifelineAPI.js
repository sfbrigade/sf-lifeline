const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  static async getPhysicians (query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians?physician=${query}&page=${page}`
    );
    return response;
  }

  static async getPhysician (id) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians/${id}`
    );
    return response;
  }

  static async registerPhysician (data) {
    const response = await fetch(`${SERVER_BASE_URL}/physicians`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  }

  static async updatePhysician (data, physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians/${physicianId}`,
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

  static async deletePhysician (physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians/${physicianId}`,
      {
        method: 'DELETE',
      }
    );
    return response;
  }

  static async getPhysicianInHospital (query, page, physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals?physicianId=${physicianId}&hospital=${query}&page=${page}`
    );
    return response;
  }

  static async getPhysicianPatients (query, page, physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians/${physicianId}/patients?patients=${query}&page=${page}`
    );
    return response;
  }
}
