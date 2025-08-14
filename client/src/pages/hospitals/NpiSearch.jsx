import { useState, useEffect } from 'react';
import { TextInput, Button, Table, Anchor, Group, Loader, Alert } from '@mantine/core';

export default function NpiSearch ({ initialName = '', onSelect }) {
  const [name, setName] = useState(initialName);
  const [state, setState] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  async function handleSubmit (event) {
    event.preventDefault();
    if (!name || state.length !== 2) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(true);

    try {
      const params = new URLSearchParams({ name, state });
      const response = await fetch(`/api/v1/npi?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Group align='flex-end'>
          <TextInput
            label='Organization Name'
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            required
          />
          <TextInput
            label='State'
            value={state}
            onChange={e => setState(e.currentTarget.value.toUpperCase())}
            maxLength={2}
            required
          />
          <Button type='submit' disabled={!name || state.length !== 2}>Search</Button>
        </Group>
      </form>
      {loading && <Loader mt='md' />}
      {error && <Alert color='red' mt='md'>{error}</Alert>}
      {!loading && searched && results.length === 0 && !error && (
        <Alert color='gray' mt='md'>No results found</Alert>
      )}
      {results.length > 0 && (
        <Table striped highlightOnHover mt='md'>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Address</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>NPI</Table.Th>
              <Table.Th>Map</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map(row => (
              <Table.Tr key={row.npi}>
                <Table.Td>{row.name}</Table.Td>
                <Table.Td>
                  <Anchor onClick={() => onSelect?.(row.address)}>{row.address}</Anchor>
                </Table.Td>
                <Table.Td>{row.phone}</Table.Td>
                <Table.Td>{row.npi}</Table.Td>
                <Table.Td>
                  <Anchor
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.address)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Map
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
}