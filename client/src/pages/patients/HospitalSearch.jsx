import PropTypes from 'prop-types';

import { useState, useRef } from 'react';
import { Combobox, ScrollArea } from '@mantine/core';

import { notifications } from '@mantine/notifications';

import SearchDatabaseInputField from './SearchDatabaseInputField';

const hospitalSearchProps = {
  form: PropTypes.object.isRequired,
};

/**
 *
 * @param {PropTypes.InferProps<typeof hospitalSearchProps>} props
 */
export default function HospitalSearch({ form }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState({ name: '', id: '' });
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');
  const abortController = useRef();

  /**
   *
   * @param {string} query
   */
  async function getHospitals(query) {
    try {
      const response = await fetch(`/api/v1/hospitals?hospital=${query}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      notifications.show({
        title: 'Error',
        message: 'Issue with reaching server',
        color: 'red',
      });
      return [];
    }
  }

  const fetchOptions = (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    getHospitals(query, abortController.current.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
        setEmpty(result.length === 0);
        abortController.current = undefined;
      })
      .catch((error) => {
        console.error(error);
        notifications.show({
          title: 'Error',
          message: 'Issue with fetching data from server',
          color: 'red',
        });
        abortController.current = undefined;
      });
  };

  const selectValue = (id, key) => {
    const name = key.children;
    setValue({ id, name });
    setSearch('');
    form.setFieldValue(`healthcareChoices.hospitalId`, id);
  };

  const removeValue = () => {
    setValue({ name: '', id: '' });
    setSearch('');
    fetchOptions('');
    form.setFieldValue(`healthcareChoices.hospitalId`, '');
  };
  const handleSearch = (query) => {
    setSearch(query);
  };
  const options = (data || []).map((item) => (
    <Combobox.Option
      value={item.id}
      key={item.id}
      active={value.name === item.name}
    >
      {item.name}
    </Combobox.Option>
  ));

  /**
   *
   * Conditional rendering of combobox content
   */
  function renderComboxContent() {
    if (empty) {
      return <Combobox.Empty>No results found</Combobox.Empty>;
    }

    if (data.length === 0) {
      return <Combobox.Empty>Start typing to search</Combobox.Empty>;
    }

    return (
      <ScrollArea.Autosize type="scroll" mah={200}>
        {options}
      </ScrollArea.Autosize>
    );
  }

  return (
    <SearchDatabaseInputField
      data={data}
      loading={loading}
      search={search}
      inputValue={value.name ? value.name : search}
      label="Hospital"
      selectValue={selectValue}
      fetchOptions={fetchOptions}
      removeValue={removeValue}
      comboboxOptions={renderComboxContent}
      handleSearch={handleSearch}
    />
  );
}

HospitalSearch.propTypes = hospitalSearchProps;
