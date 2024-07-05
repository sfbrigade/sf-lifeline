import React from 'react';
import PropTypes from 'prop-types';
import { Container, TextInput, Button, PasswordInput } from '@mantine/core';
import classes from './register.module.css';

const registrationFormProps = {
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setShowLicenseHelper: PropTypes.func.isRequired,
  formState: PropTypes.number.isRequired,
};

export function RegistrationForm({
  user,
  errors,
  isLoading,
  onFormChange,
  onSubmit,
  setShowLicenseHelper,
  formState,
}) {
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Container size="25rem" className={classes.form}>
          <TextInput
            disabled={isLoading || formState === 2}
            className=""
            name="licenseNumber"
            label="First Responder License Number"
            placeholder="License Number"
            value={user.licenseNumber}
            onChange={onFormChange}
            error={errors.licenseNumber}
          />
          <button
            hidden={formState === 2}
            onClick={setShowLicenseHelper}
            type="button"
            className={classes.button}
          >
            I don't have a license
          </button>
          {formState === 2 && (
            <>
              <TextInput
                disabled={isLoading}
                className=""
                name="firstName"
                label="First Name"
                placeholder="Sigmund"
                value={user.firstName}
                onChange={onFormChange}
                error={errors.firstName}
              />
              <TextInput
                disabled={isLoading}
                className=""
                name="middleName"
                label="Middle Name"
                placeholder="Henry"
                value={user.middleName}
                onChange={onFormChange}
                error={errors.middleName}
              />
              <TextInput
                disabled={isLoading}
                className=""
                name="lastName"
                label="Last Name"
                placeholder="Stern"
                value={user.lastName}
                onChange={onFormChange}
                error={errors.lastName}
              />
              <TextInput
                disabled={isLoading}
                className=""
                name="email"
                label="Email"
                placeholder="Email"
                value={user.email}
                onChange={onFormChange}
                error={errors.email}
              />
              <PasswordInput
                disabled={isLoading}
                className=""
                name="password"
                label="Password"
                placeholder="Password"
                value={user.password}
                onChange={onFormChange}
                error={errors.password}
              />
            </>
          )}
          <Button type="submit">
            {formState === 2 ? 'Send Interest Form' : 'Next'}
          </Button>
        </Container>
      </form>
    </>
  );
}

RegistrationForm.propTypes = registrationFormProps;
