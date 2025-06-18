const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  static async getPhysicians (query, hospitalId, page) {
    if (!query) {
      query = '';
    }
    if (!hospitalId) {
      hospitalId = '';
    }
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians?physician=${query}&hospitalId=${hospitalId}&page=${page}`
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

  static async getPhysicianPatients (query, page, physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/patients?physicianId=${physicianId}&patient=${query}&page=${page}`
    );
    return response;
  }

  static async getHospitals (query, physicianId, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals?hospital=${query}&physicianId=${physicianId}&page=${page}`
    );
    return response;
  }

  static async getHospital (id) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals/${id}`
    );
    return response;
  }

  static async getPatientsInHospital (query, hospitalId, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/patients?patient=${query}&hospitalId=${hospitalId}&page=${page}`
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
