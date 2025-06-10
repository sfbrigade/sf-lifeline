const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  static async getUsers (query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/users?search=${query}&page=${page}`, {
        credentials: 'include',
      }
    );
    return response;
  }

  static async getUser (id) {
    return fetch(`${SERVER_BASE_URL}/users/${id}`, {
      credentials: 'include',
    });
  }

  static async updateUser (id, data) {
    return fetch(`${SERVER_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  static async getHealthcareChoices (route, query) {
    if (route === 'hospital') {
      return this.getHospitals(query);
    } else if (route === 'physician') {
      return this.getPhysicians(query);
    }
  }

  static async getPhysicians (query) {
    const response = await fetch(
      `${SERVER_BASE_URL}/physicians?physician=${query}`
    );
    const data = await response.json();
    return data.map((item) => {
      return {
        ...item,
        name: `${item.firstName} ${item.lastName}`,
        hospital: item.hospitals[0]?.name,
      };
    });
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

  static async registerAllergy (data) {
    const response = await fetch(`${SERVER_BASE_URL}/allergies/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  }

  static async registerMedication (data) {
    const response = await fetch(`${SERVER_BASE_URL}/medications/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  }

  static async registerCondition (data) {
    const response = await fetch(`${SERVER_BASE_URL}/conditions/register`, {
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

  static async deletePatient (patientId) {
    const response = await fetch(`${SERVER_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
    });
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
