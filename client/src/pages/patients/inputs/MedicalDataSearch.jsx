import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import { Combobox, useCombobox, Pill, ScrollArea } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import SearchDatabaseInputField from './SearchDatabaseInputField';
import LifelineAPI from '../LifelineAPI';

const API_PATHS = {
  allergies: 'allergy',
  medications: 'medication',
  conditions: 'condition',
};

const medicalDataSearchProps = {
  category: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  initialMedicalData: PropTypes.array,
};

/**
 *  Medical Data Search component for Medical Data section of patient form
 * @param {PropTypes.InferProps<typeof medicalDataSearchProps>} props
 */
export default function MedicalDataSearch({
  category,
  form,
  initialMedicalData,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState(initialMedicalData);
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');
  const abortController = useRef();

  useEffect(() => {
    if (initialMedicalData !== undefined) {
      setValue(initialMedicalData);
    }
  }, [initialMedicalData]);

  const fetchOptions = useDebouncedCallback(async (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    try {
      const result = await LifelineAPI.getMedicalData(
        category,
        API_PATHS[category],
        query,
      );
      setData(result);
      setLoading(false);
      setEmpty(result.length === 0);
      abortController.current = undefined;
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Issue with fetching data from server',
        color: 'red',
      });
      abortController.current = undefined;
      setLoading(false);
    }
  }, 500);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleSelectValue = (id, key) => {
    const name = key.children;
    setValue((current) =>
      current.includes(id)
        ? current.filter((v) => v.id !== id)
        : [...current, { id, name }],
    );

    form.setFieldValue(`medicalData.${category}`, (current) => [
      ...current,
      id,
    ]);
    combobox.closeDropdown();
  };

  const handleValueRemove = (val) => {
    setValue((current) => current.filter((v) => v.id !== val));
    form.setFieldValue(`medicalData.${category}`, (current) =>
      current.filter((v) => v !== val),
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Backspace' && search.length === 0) {
      event.preventDefault();
    }
  };

  const values = value?.map((item) => {
    return (
      <Pill
        key={item?.id}
        withRemoveButton
        onRemove={() => handleValueRemove(item?.id)}
      >
        {item?.name}
      </Pill>
    );
  });

  const options = (data || [])
    .filter((item) => !value.some((v) => v.id === item.id))
    .map((item) => (
      <Combobox.Option
        value={item.id}
        key={item.id}
        active={value.includes(item.name)}
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

    if (options.length === 0 && search.length !== 0) {
      return <Combobox.Empty>All options selected</Combobox.Empty>;
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
      combobox={combobox}
      label={category.charAt(0).toUpperCase() + category.slice(1)}
      inputValue={search}
      searchQuery={search}
      handleSelectValue={handleSelectValue}
      fetchOptions={fetchOptions}
      comboboxOptions={renderComboxContent}
      handleSearch={setSearch}
      handleKeyDown={handleKeyDown}
    >
      <Pill.Group style={{ marginTop: '2px' }}>{values}</Pill.Group>
    </SearchDatabaseInputField>
  );
}

MedicalDataSearch.propTypes = medicalDataSearchProps;
