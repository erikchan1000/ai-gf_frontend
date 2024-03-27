import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { StyledEngineProvider } from '@mui/material';

export default function Page() {
  return (
  <StyledEngineProvider injectFirst>
    <Stack spacing={2} direction="row">
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </Stack>
  </StyledEngineProvider>
  );
}

