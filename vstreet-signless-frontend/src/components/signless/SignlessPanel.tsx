import { EzTransactionsSwitch } from 'gear-ez-transactions';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Tooltip,
  useColorModeValue,
  HStack,
  Heading,
} from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import { RelayerInfo } from './RelayerInfo';

const ALLOWED_SIGNLESS_ACTIONS = [
  'DepositCollateral',
  'WithdrawCollateral',
  'TakeLoan',
  'PayLoan',
  'DepositLiquidity',
  'WithdrawLiquidity',
];

function SignlessPanel() {
  const configIconColor = useColorModeValue('#21d4fd', '#13ff9c');
  const popoverBg = useColorModeValue('white', '#18181b');
  const popoverShadow = '0 4px 32px rgba(19,255,156,0.09)';
  return (
    <HStack bg="Black">
      <Box bg="Black" display="flex" alignItems="center" mb={2} justifyContent="flex-end" w="80%">
        <Popover placement="left">
          <Tooltip label="Session & Transaction Settings" hasArrow>
            <PopoverTrigger>
              <IconButton
                icon={<FiSettings size={22} />}
                aria-label="Session & Transaction Settings"
                variant="ghost"
                size="lg"
                borderRadius="full"
                _hover={{
                  bg: 'linear-gradient(90deg, #13ff9c 0%, #21d4fd 100%)',
                  color: '#18181b',
                  boxShadow: '0 2px 12px rgba(33, 212, 253, 0.16)',
                }}
                color={configIconColor}
                boxShadow="0 2px 12px rgba(33,212,253,.12)"
              />
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent
            bg={popoverBg}
            boxShadow={popoverShadow}
            borderRadius="xl"
            border="none"
            minW="310px"
            p={4}
            _focus={{ outline: 'none' }}>
            <PopoverBody>
              <Box
                mb={2}
                fontWeight="bold"
                fontSize="lg"
                color={configIconColor}
                display="flex"
                alignItems="center"
                gap={2}>
                <FiSettings />
                Advanced Transaction Settings
              </Box>
              <Box>
                <EzTransactionsSwitch allowedActions={ALLOWED_SIGNLESS_ACTIONS} />
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
      <RelayerInfo />
    </HStack>
  );
}

export { SignlessPanel };
