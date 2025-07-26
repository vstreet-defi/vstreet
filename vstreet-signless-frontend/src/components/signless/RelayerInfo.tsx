import { useSignlessTransactions } from 'gear-ez-transactions';
import { encodeAddress } from '@polkadot/util-crypto';
import { useNativeBalance } from '@/hooks/useNativeBalance';
import { useAccount, useApi } from '@gear-js/react-hooks';
import BN from 'bn.js';
import {
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  useDisclosure,
  Text,
  Box,
} from '@chakra-ui/react';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { MdSavings } from 'react-icons/md';
import { GiReceiveMoney } from 'react-icons/gi';
import { useState } from 'react';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';

function formatVaraBalance(balance: bigint | undefined): string {
  if (!balance) return '0.00';
  const VARA = 10n ** 12n;
  const intPart = balance / VARA;
  const decimalPart = ((balance % VARA) * 100n) / VARA;
  return `${intPart}.${decimalPart.toString().padStart(2, '0')}`;
}

const gradientIcon = {
  background: 'linear-gradient(90deg, #00ffc4, #4fff4b)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
};

export function RelayerInfo() {
  const signless = useSignlessTransactions();
  const relayerAddress = signless.pair ? encodeAddress(signless.pair.address, 137) : undefined;
  const balance = useNativeBalance(relayerAddress);
  const { account } = useAccount();
  const { api } = useApi();

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<'delegate' | 'return' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [txPending, setTxPending] = useState<'delegate' | 'return' | null>(null);

  function openModal(type: 'delegate' | 'return') {
    setModalType(type);
    setAmountInput('');
    onOpen();
  }

  // Delegar tokens al relayer
  async function handleDelegateTokens(amount: bigint) {
    if (!account) {
      alert('Wallet not connected');
      return;
    }

    await web3Enable('vStreet');
    const injector = await web3FromSource(account.meta.source);
    if (!api || !account || !relayerAddress) return;
    try {
      const bnAmount = new BN(amount.toString());
      setTxPending('delegate');
      const unsub = await api.balance
        .transfer(relayerAddress, bnAmount)
        .signAndSend(account.decodedAddress, { signer: injector.signer }, ({ status }) => {
          if (status.isInBlock || status.isFinalized) {
            setTxPending(null);
            unsub && unsub();
            onClose();
          }
        });
    } catch (e) {
      setTxPending(null);
      alert('Error delegating: ' + (e instanceof Error ? e.message : e));
    }
  }

  // Devolver tokens al usuario
  async function handleReturnTokens(amount: bigint) {
    if (!api || !signless.pair || !account) return;
    try {
      const bnAmount = new BN(amount.toString());
      setTxPending('return');
      const unsub = await api.balance.transfer(account.address, bnAmount).signAndSend(signless.pair, ({ status }) => {
        if (status.isInBlock || status.isFinalized) {
          setTxPending(null);
          unsub && unsub();
          onClose();
        }
      });
    } catch (e) {
      setTxPending(null);
      alert('Error returning: ' + (e instanceof Error ? e.message : e));
    }
  }

  function handleSubmit() {
    const amount = BigInt(Math.floor(Number(amountInput) * 1e12));
    if (!amount || amount <= 0) return;
    if (modalType === 'delegate') handleDelegateTokens(amount);
    if (modalType === 'return') handleReturnTokens(amount);
  }

  const gradientText = {
    background: 'linear-gradient(90deg, #00ffc4, #4fff4b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
  };

  const gradientBorder =
    '2px solid transparent; background-image: linear-gradient(#15181D, #15181D), linear-gradient(90deg, #00ffc4, #4fff4b); background-origin: border-box; background-clip: padding-box, border-box;';

  return (
    <div
      style={{
        color: 'white',
        fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
        fontWeight: 400,
        textAlign: 'right',
        marginBottom: '16px',
      }}>
      <HStack spacing={1} justify="flex-end" align="flex-end">
        <Box
          style={{
            background: '#15181D',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 700,
            width: 'fit-content',
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px rgba(26,255,155,0.10)',
            marginLeft: 0,
            textAlign: 'right',
            minWidth: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(#15181D, #15181D), linear-gradient(90deg, #00ffc4, #4fff4b)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}>
          {relayerAddress === undefined ? (
            <span style={{ color: '#ff4747', fontWeight: 700 }}>Signless Mode: Inactive</span>
          ) : (
            <>
              <span style={gradientText}>{formatVaraBalance(balance)} TVARA</span>
              <IconButton
                aria-label="Delegate"
                icon={<AiOutlinePlusCircle size={22} />}
                size="sm"
                color="white"
                bg="transparent"
                _hover={{ bg: 'rgba(0,255,196,0.1)' }}
                onClick={() => openModal('delegate')}
                ml={2}
              />
              <IconButton
                aria-label="Return"
                icon={<AiOutlineMinusCircle size={22} />}
                size="sm"
                color="white"
                bg="transparent"
                _hover={{ bg: 'rgba(79,255,75,0.08)' }}
                onClick={() => openModal('return')}
                ml={1}
                isDisabled={!balance || balance < 1n}
              />
              <IconButton
                aria-label="Receive"
                icon={<GiReceiveMoney size={22} />}
                size="sm"
                color="white"
                bg="transparent"
                _hover={{ bg: 'rgba(0,255,196,0.07)' }}
                onClick={() => openModal('return')}
                ml={1}
                isDisabled={!balance || balance < 1n}
              />
            </>
          )}
        </Box>
      </HStack>

      {/* Modal ultra custom */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="#0a0e13"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(36,229,194,0.15)"
          border="2px solid transparent"
          backgroundImage="linear-gradient(#0a0e13, #0a0e13), linear-gradient(90deg, #00ffc4, #4fff4b)"
          backgroundClip="padding-box, border-box"
          color="white">
          <ModalHeader
            textAlign="center"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight={700}
            style={gradientText}
            pb={0}>
            {modalType === 'delegate' ? (
              <>
                <AiOutlinePlusCircle style={{ marginBottom: -4, marginRight: 4, fontSize: 24 }} />
                Delegate Tokens
              </>
            ) : (
              <>
                <AiOutlineMinusCircle style={{ marginBottom: -4, marginRight: 4, fontSize: 24 }} />
                Withdraw Tokens
              </>
            )}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <Text mb={2} fontSize={16} textAlign="center" style={gradientText} fontFamily="'JetBrains Mono', monospace">
              {modalType === 'delegate'
                ? 'Send tokens from your wallet to the relayer'
                : 'Withdraw tokens from relayer to your wallet'}
            </Text>
            <Input
              placeholder="Amount (TVARA)"
              size="lg"
              mb={4}
              bg="#101419"
              color="white"
              border="2px solid transparent"
              backgroundImage="linear-gradient(#101419, #101419), linear-gradient(90deg, #00ffc4, #4fff4b)"
              backgroundClip="padding-box, border-box"
              borderRadius="lg"
              fontFamily="'JetBrains Mono', monospace"
              type="number"
              min="0"
              step="0.0001"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              _placeholder={{ color: '#00ffc4' }}
            />
            <Button
              w="100%"
              color="white"
              bg="linear-gradient(90deg, #00ffc4 40%, #4fff4b 100%)"
              fontWeight={700}
              fontFamily="'JetBrains Mono', monospace"
              _hover={{
                bg: 'linear-gradient(90deg, #00ffc4 10%, #4fff4b 90%)',
                color: '#15181D',
              }}
              isLoading={txPending === modalType}
              onClick={handleSubmit}
              disabled={!amountInput || Number(amountInput) <= 0}>
              {modalType === 'delegate' ? 'Delegate' : 'Withdraw'}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
