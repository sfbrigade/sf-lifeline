import { useState, Fragment } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Loader,
  NativeSelect,
  NumberInput,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { QRCode } from 'react-qrcode-logo';

import classes from './PatientsGenerate.module.css';

/**
 *
 * @returns {React.ReactElement}
 */
function PatientsGenerate () {
  const [numPages, setNumPages] = useState(1);
  const [layout, setLayout] = useState(12);
  const { isLoading, data } = useQuery({
    queryKey: ['generate', numPages, layout],
    queryFn: () =>
      fetch(`/api/v1/patients/generate?count=${numPages * layout}`).then(
        (response) => response.json()
      ),
  });

  const pages = [];
  if (data) {
    for (let i = 0; i < numPages; i += 1) {
      pages.push(data.slice(i * layout, (i + 1) * layout));
    }
  }

  return (
    <Container className={classes.container}>
      <Box className={classes.controls}>
        <Group mb='1rem'>
          <NumberInput
            label='Number of pages'
            min={1}
            value={numPages}
            onChange={setNumPages}
          />
          <NativeSelect
            label='Layout'
            value={layout}
            onChange={(event) => setLayout(parseInt(event.target.value, 10))}
            data={[
              { label: '2" x 2", 12 per 8.5" x 11"', value: '12' },
              { label: '2" x 2", 20 per 8.5" x 11"', value: '20' },
            ]}
          />
          <Button onClick={() => window.print()} mt='1.625rem'>
            Print
          </Button>
        </Group>
        <Box>Note: set scale to 100% and margins to 0 for proper printing.</Box>
      </Box>
      {isLoading && <Loader />}
      {!isLoading &&
        pages.map((p) => (
          <Fragment key={p}>
            <Flex
              wrap='wrap'
              className={`${classes.codes} ${classes[`codes--${layout}`]}`}
            >
              {p.map((url, i) => (
                <Fragment key={url}>
                  <Box className={classes.code}>
                    <QRCode id={`qrcode-${i}`} key={url} value={url} />
                  </Box>
                </Fragment>
              ))}
            </Flex>
          </Fragment>
        ))}
    </Container>
  );
}
export default PatientsGenerate;
