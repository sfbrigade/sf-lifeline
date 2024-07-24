import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

/**
 * Home page component.
 */
function Index() {
  return (
    <main>
      <h1>SF Life Line</h1>
      <p>
        Provide more efficient and equitable care with timely access to patient
        information.
      </p>
      <div>
        <h2>First Responder Interest Form</h2>
        <h3>Benefits of Signing Up</h3>
        <p>
          You will obtain timely access to patient healthcare information. This
          can be helpful in situations where there are barriers to care,
          including language barriers or mental incapacity.
        </p>
        <Button component={Link} to="/register">
          Sign Up
        </Button>
        &nbsp;
        <Button component={Link} to="/login" variant="default">
          Log In
        </Button>
      </div>
    </main>
  );
}

export default Index;
