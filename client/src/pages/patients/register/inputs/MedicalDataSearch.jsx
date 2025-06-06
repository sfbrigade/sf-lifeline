import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';
import { Box, Combobox, useCombobox, Pill, ScrollArea, Text } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import SearchDatabaseInputField from './SearchDatabaseInputField';
import RegisterAllergy from './RegisterAllergy';
import RegisterMedication from './RegisterMedication';
import LifelineAPI from '../../LifelineAPI';

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
export default function MedicalDataSearch ({
  category,
  form,
  initialMedicalData,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState(initialMedicalData);
  const [search, setSearch] = useState('');
  const [
    registerAllergyOpened,
    { open: openRegisterAllergy, close: closeRegisterAllergy },
  ] = useDisclosure(false);
  const [
    registerMedicationOpened,
    { open: openRegisterMedication, close: closeRegisterMedication },
  ] = useDisclosure(false);
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
        query
      );
      setData(result);
      setLoading(false);
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
    if (id === "$register") {
      if (category === 'allergies') {
        openRegisterAllergy();
      } else if (category === 'medications') {
        openRegisterMedication();
      }
      combobox.closeDropdown();
      setSearch("");
    } else {
      const name = key.children;
      setValue((current) =>
        current.includes(id)
          ? current.filter((v) => v.id !== id)
          : [...current, { id, name }]
      );

      form.setFieldValue(`medicalData.${category}`, (current) => [
        ...current,
        id,
      ]);
      combobox.closeDropdown();
      setSearch("");
    }
  };

  const handleValueRemove = (val) => {
    setValue((current) => current.filter((v) => v.id !== val));
    form.setFieldValue(`medicalData.${category}`, (current) =>
      current.filter((v) => v !== val)
    );
  };

  const values = value?.map((item) => {
    return (
      <Pill
        key={item?.id}
        withRemoveButton
        radius='md'
        size='md'
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
    const registerOption = (
      <Combobox.Option value="$register">
        <Text fw={700} size="sm">
          + Register new {category}
        </Text>
      </Combobox.Option>
    );

    if (data.length === 0 && search.length === 0) {
      return (
        <>
          <Combobox.Empty>Start typing to search</Combobox.Empty>
          {(category === 'allergies' || category === 'medications') && registerOption}
        </>
      );
    }

    if (options.length === 0) {
      return (
        <>
          <Combobox.Empty>No results found</Combobox.Empty>
          {(category === 'allergies' || category === 'medications') && registerOption}
        </>
      );
    }

    return (
      <ScrollArea.Autosize type="scroll" mah={200}>
        {options}
        {(category === 'allergies' || category === 'medications') && registerOption}
      </ScrollArea.Autosize>
    );
  }

  return (
    <Box>
      <SearchDatabaseInputField
        data={data}
        loading={loading}
        combobox={combobox}
        label={category.charAt(0).toUpperCase() + category.slice(1)}
        searchQuery={search}
        handleSelectValue={handleSelectValue}
        fetchOptions={fetchOptions}
        comboboxOptions={renderComboxContent}
        handleSearch={setSearch}
      >
        <Pill.Group style={{ marginTop: "6px" }}>{values}</Pill.Group>
      </SearchDatabaseInputField>
      <RegisterAllergy
        setAllergy={handleSelectValue}
        registerAllergyOpened={registerAllergyOpened}
        closeRegisterAllergy={closeRegisterAllergy}
        fetchOptions={fetchOptions}
      />
      <RegisterMedication
        setMedication={handleSelectValue}
        registerMedicationOpened={registerMedicationOpened}
        closeRegisterMedication={closeRegisterMedication}
        fetchOptions={fetchOptions}
      />
    </Box>
  );
}

MedicalDataSearch.propTypes = medicalDataSearchProps;
