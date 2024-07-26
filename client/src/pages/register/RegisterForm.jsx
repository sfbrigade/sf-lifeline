import React from 'react';
import PropTypes from 'prop-types';
import { Container, TextInput, Button, PasswordInput, Loader } from '@mantine/core';
import classes from './register.module.css';

const registerFormProps = {
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  showLicenseHelper: PropTypes.bool.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setShowLicenseHelper: PropTypes.func.isRequired,
  formState: PropTypes.number.isRequired,
};

/**
 * Register Form component for Register page
 * @param {PropTypes.InferProps<typeof registerFormProps>} props
 */
export function RegisterForm({
  user,
  errors,
  isLoading,
  showLicenseHelper,
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
          {formState !== 3 && (
            <>
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
                I don&#39;t have a license
              </button>
            </>
          )}
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
          <Container
            hidden={!showLicenseHelper}
            size="25rem"
            styles={{ root: { padding: 0 } }}
          >
            <div className={classes.licenseHelper}>
              <h3>License not found?</h3>
              <p>
                Contact{' '}
                <a href="mailto:admin@SFLifeline.com">admin@SFLifeline.com</a>{' '}
                if we have made a mistake.
              </p>
              <h3>Don&#39;t have a license?</h3>
              <p>
                Sign up to volunteer! Email{' '}
                <a href="mailto:admin@SFLifeline.com">admin@SFLifeline.com</a>{' '}
                with your name and contact information.
              </p>
            </div>
          </Container>
          {formState !== 3 && 
            <Button type="submit" disabled={!user.licenseNumber.length || isLoading}>
              {
                isLoading ? <Loader size={20} /> : formState === 2 ? 'Send Interest Form' : 'Next'
              }
            </Button>
          }

          {formState === 3 && 
            <Container
              size="25rem"
              styles={{ root: { padding: 0 } }}
            >
              <div className={classes.formCompletion}>
                <p>Form Complete! You will receive a confirmation email shortly. Acceptance into SF life line will also be sent via the email address you submitted.</p>
                <p>Save this site to your browser window for convenience.</p>
              </div>
            </Container>
          }
        </Container>
      </form>
    </>
  );
}

RegisterForm.propTypes = registerFormProps;
