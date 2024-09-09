import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import {
  Loader,
  Combobox,
  useCombobox,
  Pill,
  ScrollArea,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

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

  /**
   *
   * @param {string} query
   */
  async function getMedicalData(query) {
    try {
      const response = await fetch(
        `/api/v1/${category}?${API_PATHS[category]}=${query}`,
      );
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

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (id, key) => {
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

  const fetchOptions = (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    getMedicalData(query, abortController.current.signal)
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
    <Combobox
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.DropdownTarget>
        <Combobox.EventsTarget>
          <TextInput
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            onFocus={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(search);
              }
            }}
            onClick={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(search);
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
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && search.length === 0) {
                event.preventDefault();
              }
            }}
            rightSection={loading ? <Loader size="xs" /> : null}
          />
        </Combobox.EventsTarget>
      </Combobox.DropdownTarget>

      <Pill.Group style={{ marginTop: '2px' }}> {values}</Pill.Group>
      <Combobox.Dropdown>
        <Combobox.Options>{renderComboxContent()}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

MedicalDataSearch.propTypes = medicalDataSearchProps;
