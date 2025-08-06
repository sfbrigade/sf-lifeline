const SERVER_BASE_URL = '/api/v1';

export default class LifelineAPI {
  // --- USERS ---
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

  // --- PHYSICIANS ---
  static async getPhysicians (query, hospitalId, page) {
    if (typeof hospitalId === 'undefined' && typeof page === 'undefined') {
      // Called from getHealthcareChoices (autocomplete)
      const response = await fetch(
        `${SERVER_BASE_URL}/physicians?physician=${query}`
      );
      const data = await response.json();
      return data.map((item) => {
        return {
          ...item,
          name: `${item.firstName} ${item.lastName}`,
          hospital: item.hospitals?.[0]?.name,
        };
      });
    } else {
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

  // --- PATIENTS ---
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

  static async getPhysicianPatients (query, page, physicianId) {
    const response = await fetch(
      `${SERVER_BASE_URL}/patients?physicianId=${physicianId}&patient=${query}&page=${page}`
    );
    return response;
  }

  static async getPatientsInHospital (query, hospitalId, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/patients?patient=${query}&hospitalId=${hospitalId}&page=${page}`
    );
    return response;
  }

  // --- HOSPITALS ---
  static async getHospitals (query, physicianId, page) {
    // Support both usages: with/without physicianId and page
    if (typeof physicianId === 'undefined' && typeof page === 'undefined') {
      // Called from getHealthcareChoices (autocomplete)
      const response = await fetch(
        `${SERVER_BASE_URL}/hospitals?hospital=${query}`
      );
      const data = await response.json();
      return data;
    } else {
      // Original version with physicianId and page
      const response = await fetch(
        `${SERVER_BASE_URL}/hospitals?hospital=${query}&physicianId=${physicianId}&page=${page}`
      );
      return response;
    }
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

  static async getAllergies(query, page) {
    const response = await fetch(
      `${SERVER_BASE_URL}/allergies?allergy=${query}&page=${page}`
    );
    return response;
  }

  static async getAllergy(id) {
    const response = await fetch(
      `${SERVER_BASE_URL}/allergies/${id}`
    );
    return response;
  }

  static async createAllergy(data) {
    const response = await fetch(`${SERVER_BASE_URL}/allergies/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  // --- MISCELLANEOUS ---
  static async getHealthcareChoices (route, query) {
    if (route === 'hospital') {
      return this.getHospitals(query);
    } else if (route === 'physician') {
      return this.getPhysicians(query);
    }
  }

  static async getMedicalData (path, pathInfo, query) {
    const response = await fetch(
      `${SERVER_BASE_URL}/${path}?${pathInfo}=${query}`
    );
    const data = await response.json();
    return data;
  }
}
