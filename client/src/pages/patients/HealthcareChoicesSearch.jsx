import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import { Combobox, ScrollArea } from '@mantine/core';

import { notifications } from '@mantine/notifications';
import SearchDatabaseInputField from './SearchDatabaseInputField';

import LifelineAPI from './LifelineAPI.js';

const healthcareChoicesSearchProps = {
  form: PropTypes.object.isRequired,
  choice: PropTypes.string.isRequired,
  initialData: PropTypes.object,
};

/**
 *
 * @param {PropTypes.InferProps<typeof healthcareChoicesSearchProps>} props
 */
export default function HealthcareChoicesSearch({ form, choice, initialData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState({ name: '', id: '' });
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');

  const abortController = useRef();

  useEffect(() => {
    if (initialData !== undefined) {
      setValue(initialData);
    }
  }, [initialData]);

  const fetchOptions = (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    LifelineAPI.getHealthcareChoices(
      choice,
      query,
      abortController.current.signal,
    )
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
    form.setFieldValue(`healthcareChoices.${choice}Id`, id);
  };

  const removeValue = () => {
    setValue({ name: '', id: '' });
    setSearch('');
    fetchOptions('');
    form.setFieldValue(`healthcareChoices.${choice}Id`, '');
  };

  const handleSearch = (query) => {
    setSearch(query);
  };

  const options = (data || []).map((item) => (
    <Combobox.Option value={item.id} key={item.id}>
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
      label={choice === 'hospital' ? 'Hospital' : 'Preferred Care Provider'}
      selectValue={selectValue}
      fetchOptions={fetchOptions}
      removeValue={removeValue}
      comboboxOptions={renderComboxContent}
      handleSearch={handleSearch}
    />
  );
}

HealthcareChoicesSearch.propTypes = healthcareChoicesSearchProps;
