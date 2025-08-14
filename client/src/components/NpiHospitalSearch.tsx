import React, { useState, useEffect } from 'react';
import { NpiResult } from '../types';
import './NpiHospitalSearch.module.css'; // Import the CSS module

interface NpiHospitalSearchProps {}

const NpiHospitalSearch: React.FC<NpiHospitalSearchProps> = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [results, setResults] = useState<NpiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This is a placeholder for any initial setup or cleanup
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `/api/npi-registry?organization_name=${organizationName}&state=${stateCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch from NPI Registry: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        const parsedResults: NpiResult[] = data.results.map((result: any) => {
          const address = result.addresses?.[0];
          return {
            name: result.basic?.organization_name || 'N/A',
            address: address
              ? `${address.address_1}, ${address.city}, ${address.state} ${address.postal_code}`
              : 'N/A',
            phone: address?.telephone_number || 'N/A',
            npi: result.number || 'N/A',
          };
        });
        setResults(parsedResults);
      } else {
        setResults([]); // Ensure results is an empty array if no results are found
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="npi-hospital-search">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="organizationName">Hospital/Organization Name:</label>
          <input
            type="text"
            id="organizationName"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="stateCode">State Code (2-letter):</label>
          <input
            type="text"
            id="stateCode"
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value.toUpperCase())}
            required
            minLength={2}
            maxLength={2}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading-message">Loading...</div>}

      {!loading && results.length === 0 && error === null && (
        <div className="no-results-message">No results found.</div>
      )}

      {!loading && results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>NPI</th>
              <th>Map</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.name}</td>
                <td>{result.address}</td>
                <td>{result.phone}</td>
                <td>{result.npi}</td>
                <td>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      result.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Map
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NpiHospitalSearch;
