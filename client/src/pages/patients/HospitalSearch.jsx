import PropTypes from 'prop-types';

import { useState, useRef } from 'react';
import {
  Loader,
  Combobox,
  useCombobox,
  ScrollArea,
  TextInput,
} from '@mantine/core';

import { notifications } from '@mantine/notifications';

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

  console.log({ value, search });

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

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

  const handleValueSelect = (id, key) => {
    const name = key.children;
    setValue({ id, name });
    setSearch('');
    form.setFieldValue(`healthcareChoices.hospitalId`, id);
    combobox.closeDropdown();
  };

  const handleValueRemove = () => {
    setValue({ name: '', id: '' });
    setSearch('');
    fetchOptions('');
    form.setFieldValue(`healthcareChoices.hospitalId`, '');
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
    <Combobox
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.DropdownTarget>
        <Combobox.EventsTarget>
          <TextInput
            label="Hospital"
            onFocus={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(value);
              }
            }}
            onClick={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(value);
              }
            }}
            onBlur={() => combobox.closeDropdown()}
            value={value.name ? value.name : search}
            placeholder={`Search Hospital`}
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
                handleValueRemove();
              }
            }}
            rightSection={loading ? <Loader size="xs" /> : null}
          />
        </Combobox.EventsTarget>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>{renderComboxContent()}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

HospitalSearch.propTypes = hospitalSearchProps;
