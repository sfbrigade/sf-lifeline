import PropTypes from 'prop-types';

import { Combobox, Loader, TextInput } from '@mantine/core';

const searchDatabaseInputFieldProps = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  combobox: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  handleSelectValue: PropTypes.func.isRequired,
  fetchOptions: PropTypes.func.isRequired,
  comboboxOptions: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  children: PropTypes.object,
};

/**
 *
 * @param {PropTypes.InferProps<typeof searchDatabaseInputFieldProps>} props
 */
export default function SearchDatabaseInputField({
  data,
  loading,
  searchQuery,
  label,
  combobox,
  handleSelectValue,
  fetchOptions,
  comboboxOptions,
  handleSearch,
  children = undefined,
}) {
  return (
    <Combobox
      onOptionSubmit={handleSelectValue}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.DropdownTarget>
        <Combobox.EventsTarget>
          <TextInput
            label={label}
            onFocus={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(searchQuery);
              }
            }}
            onClick={() => {
              combobox.openDropdown();
              if (data === null) {
                fetchOptions(searchQuery);
              }
            }}
            onBlur={() => combobox.closeDropdown()}
            value={searchQuery}
            placeholder={`Search ${label}`}
            onChange={(event) => {
              combobox.updateSelectedOptionIndex();
              handleSearch(event.currentTarget.value);
              fetchOptions(event.currentTarget.value);
              combobox.updateSelectedOptionIndex();
              combobox.openDropdown();
            }}
            rightSection={loading ? <Loader size="xs" /> : null}
          />
        </Combobox.EventsTarget>
      </Combobox.DropdownTarget>
      {children}
      <Combobox.Dropdown>
        <Combobox.Options>{comboboxOptions()}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

SearchDatabaseInputField.propTypes = searchDatabaseInputFieldProps;
