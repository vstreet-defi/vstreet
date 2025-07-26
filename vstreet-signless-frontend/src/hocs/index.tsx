import {
  ApiProvider as GearApiProvider,
  AlertProvider as GearAlertProvider,
  AccountProvider as GearAccountProvider,
  ProviderProps,
  useProgram,
} from '@gear-js/react-hooks';
import {
  SignlessTransactionsProvider as SharedSignlessTransactionsProvider,
  GaslessTransactionsProvider as SharedGaslessTransactionsProvider,
  EzTransactionsProvider,
} from 'gear-ez-transactions';
import { Alert, alertStyles } from '@gear-js/vara-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentType } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Program } from './lib';
//import { Program as HelloProgram } from './Hello';

import { ADDRESS } from '@/consts';

import { name as appName } from '../../package.json';

function ApiProvider({ children }: ProviderProps) {
  return <GearApiProvider initialArgs={{ endpoint: ADDRESS.NODE }}>{children}</GearApiProvider>;
}

function AlertProvider({ children }: ProviderProps) {
  return (
    <GearAlertProvider template={Alert} containerClassName={alertStyles.root}>
      {children}
    </GearAlertProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function GaslessTransactionsProvider({ children }: ProviderProps) {
  return (
    <SharedGaslessTransactionsProvider
      programId={import.meta.env.VITE_PROGRAMID}
      backendAddress={import.meta.env.VITE_BACKEND}
      voucherLimit={18}>
      {children}
    </SharedGaslessTransactionsProvider>
  );
}

function SignlessTransactionsProvider({ children }: ProviderProps) {
  const { data: program } = useProgram({ library: Program, id: import.meta.env.VITE_PROGRAMID });

  if (!program) return null;

  return (
    <SharedSignlessTransactionsProvider programId={import.meta.env.VITE_PROGRAMID} program={program}
>
      {children}
    </SharedSignlessTransactionsProvider>
  );
}


function QueryProvider({ children }: ProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function AccountProvider({ children }: ProviderProps) {
  return <GearAccountProvider appName={appName}>{children}</GearAccountProvider>;
}

const providers = [
  BrowserRouter,
  AlertProvider,
  ApiProvider,              
  AccountProvider,         
  QueryProvider,
  SignlessTransactionsProvider, 
  GaslessTransactionsProvider,  
  EzTransactionsProvider,
];


function withProviders(Component: ComponentType) {
  return () => providers.reduceRight((children, Provider) => <Provider>{children}</Provider>, <Component />);
}

export { withProviders };
