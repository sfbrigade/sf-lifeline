import PropTypes from 'prop-types';

import { Loader, Combobox, useCombobox, Pill, PillsInput } from '@mantine/core';
import { useState, useRef } from 'react';

const medicalDataSearchProps = {
  category: PropTypes.string.isRequired,
  handleMedicalData: PropTypes.func.isRequired,
};

/**
 *  Medical Data Search component for Medical Data section of patient form
 * @param {PropTypes.InferProps<typeof medicalDataSearchProps>} props
 */

export default function MedicalDataSearch({ category, handleMedicalData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');
  const abortController = useRef();

  const API_PATHS = {
    allergies: 'allergy',
    medications: 'medication',
    conditions: 'condition',
  };

  async function getAsyncData(query) {
    const response = await fetch(
      `/api/v1/${category}?${API_PATHS[category]}=${query}`,
    );
    const data = await response.json();
    return data;
  }

  const handleValueSelect = (id, key) => {
    const name = key.children;
    setValue((current) =>
      current.includes(id)
        ? current.filter((v) => v.id !== id)
        : [...current, { id, name }],
    );
    handleMedicalData((current) => ({
      ...current,
      [category]: [...current[category], id],
    }));
  };

  const handleValueRemove = (val) => {
    setValue((current) => current.filter((v) => v.id !== val));
    handleMedicalData((current) => ({
      ...current,
      [category]: current[category].filter((v) => v.id !== val),
    }));
  };

  const values = value.map((item) => {
    return (
      <Pill
        key={item.id}
        withRemoveButton
        onRemove={() => handleValueRemove(item.id)}
      >
        {item.name}
      </Pill>
    );
  });

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const fetchOptions = (query) => {
    console.log(query);
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    getAsyncData(query, abortController.current.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
        setEmpty(result.length === 0);
        abortController.current = undefined;
      })
      .catch(() => {});
  };

  const options = (data || []).map((item) => (
    <Combobox.Option
      value={item.id}
      key={item.id}
      active={value.includes(item.name)}
    >
      {item.name}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()} label={category}>
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => {
                  combobox.openDropdown();
                  if (data === null) {
                    fetchOptions(value);
                  }
                }}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={`Search ${category}`}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                  fetchOptions(event.currentTarget.value);
                  combobox.resetSelectedOption();
                  combobox.openDropdown();
                }}
                rightSection={loading && <Loader size={18} />}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown hidden={data === null}>
        <Combobox.Options>
          {options}
          {empty && <Combobox.Empty>No results found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
