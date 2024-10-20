import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import { Combobox, useCombobox, ScrollArea, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';

import SearchDatabaseInputField from './SearchDatabaseInputField';
import RegisterPhysician from './RegisterPhysician';

import LifelineAPI from '../../LifelineAPI.js';

const healthcareChoicesSearchProps = {
  form: PropTypes.object.isRequired,
  choice: PropTypes.string.isRequired,
  initialData: PropTypes.string,
};

/**
 *
 * @param {PropTypes.InferProps<typeof healthcareChoicesSearchProps>} props
 */
export default function HealthcareChoicesSearch({ form, choice, initialData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [search, setSearch] = useState('');
  const [
    registerPhysicianOpened,
    { open: openRegisterPhysician, close: closeRegisterPhysician },
  ] = useDisclosure(false);

  const abortController = useRef();

  useEffect(() => {
    if (initialData.length > 0) {
      setSearch(initialData);
    }
  }, [initialData]);

  const fetchOptions = useDebouncedCallback(async (query) => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    try {
      const result = await LifelineAPI.getHealthcareChoices(
        choice,
        query,
        abortController.current.signal,
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

  const handleSearch = (query) => {
    setSearch(query);
  };

  const handleSelectValue = (id, key) => {
    if (id === '$register') {
      return;
    }
    const name = key?.children ?? key;
    setSearch(name);
    form.setFieldValue(`healthcareChoices.${choice}Id`, id);
    combobox.closeDropdown();
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
      return choice === 'physician' ? (
        <>
          <Combobox.Empty> No results found</Combobox.Empty>
          <Combobox.Option value="$register" onClick={openRegisterPhysician}>
            <Text fw={700} size="sm">
              + Register new physician
            </Text>
          </Combobox.Option>
        </>
      ) : (
        <Combobox.Empty>No results found</Combobox.Empty>
      );
    }

    if (data.length === 0) {
      return <Combobox.Empty>Start typing to search</Combobox.Empty>;
    }

    return (
      <ScrollArea.Autosize type="scroll" mah={200}>
        {options}
        <Combobox.Option value="$register" onClick={openRegisterPhysician}>
          <Text fw={700} size="sm">
            + Register new physician
          </Text>
        </Combobox.Option>
      </ScrollArea.Autosize>
    );
  }

  return (
    <>
      <SearchDatabaseInputField
        data={data}
        loading={loading}
        combobox={combobox}
        label={
          choice === 'hospital'
            ? 'Hospital of Choice'
            : 'Preferred Care Provider'
        }
        searchQuery={search}
        handleSelectValue={handleSelectValue}
        fetchOptions={fetchOptions}
        comboboxOptions={renderComboxContent}
        handleSearch={handleSearch}
      />
      {choice === 'physician' && (
        <RegisterPhysician
          setPhysician={handleSelectValue}
          opened={registerPhysicianOpened}
          close={closeRegisterPhysician}
          fetchOptions={fetchOptions}
        />
      )}
    </>
  );
}

HealthcareChoicesSearch.propTypes = healthcareChoicesSearchProps;
