const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  static async getUsers (query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/users?user=${query}&page=${page}`, {
        credentials: 'include',
      }
    );
    return response;
  }

  static async getHealthcareChoices (route, query) {
    if (route === 'hospital') {
      return this.getHospitals(query);
    } else if (route === 'physician') {
      return this.getPhysicians(query);
    }
  }

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

  static async getHospitals (query) {
    const response = await fetch(
      `${SERVER_BASE_URL}/hospitals?hospital=${query}`
    );
    const data = await response.json();
    return data;
  }

  static async getPatient (patientId) {
    const response = await fetch(`${SERVER_BASE_URL}/patients/${patientId}`);
    return response;
  }

  static async getPatients (query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/patients?patient=${query}&page=${page}`
    );
    return response;
  }

  static async registerPatient (data, patientId) {
    const response = await fetch(`${SERVER_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, id: patientId }),
    });

    return response;
  }

  static async updatePatient (data, patientId) {
    const response = await fetch(`${SERVER_BASE_URL}/patients/${patientId}`, {
      method: 'PATCH',
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

  static async deletePatient (patientId) {
    const response = await fetch(`${SERVER_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
    });
    return response;
  }

  static async deletePhysicians (physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians/${physicianId}`,
      {
        method: 'DELETE',
      }
    );
    return response;
  }

  static async getMedicalData (path, pathInfo, query) {
    const response = await fetch(
      `${SERVER_BASE_URL}/${path}?${pathInfo}=${query}`
    );
    const data = await response.json();
    return data;
  }
}
