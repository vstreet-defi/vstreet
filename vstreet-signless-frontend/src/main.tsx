import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { App } from './App';
import { UserInfoProvider } from './contexts/userInfoContext';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

root.render(
  <ChakraProvider>
    <UserInfoProvider>
      <App />
    </UserInfoProvider>
  </ChakraProvider>,
);
