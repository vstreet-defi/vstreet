import { Box, Text, Flex } from '@chakra-ui/react';
import { MdCheckCircle, MdError } from 'react-icons/md';

export function Toast({ type = 'success', message = 'Transaction executed!' }) {
  const borderColor =
    type === 'success'
      ? 'linear-gradient(90deg, #13ff9c 0%, #21d4fd 100%)'
      : 'linear-gradient(90deg, #fd2155 0%, #21d4fd 100%)';

  const iconColor = type === 'success' ? '#13ff9c' : '#fd2155';

  return (
    <Flex
      align="center"
      px={6}
      py={4}
      minW="340px"
      maxW="440px"
      bg="linear-gradient(90deg, rgba(16,23,18,0.94) 0%, rgba(8,10,13,0.98) 100%)"
      border="1.5px solid"
      borderColor="transparent"
      borderRadius="lg"
      boxShadow="0 2px 24px 0 rgba(30,255,255,0.05)"
      position="relative"
      sx={{
        borderImage: borderColor + ' 1',
        transition: 'all .18s cubic-bezier(.4,0,.2,1)',
      }}>
      {type === 'success' ? (
        <MdCheckCircle size={28} color={iconColor} style={{ marginRight: 14 }} />
      ) : (
        <MdError size={28} color={iconColor} style={{ marginRight: 14 }} />
      )}
      <Text
        fontFamily="Fira Mono, monospace"
        color="#13ff9c"
        fontWeight="bold"
        fontSize="1.1rem"
        letterSpacing="0.01em"
        userSelect="none">
        {message}
      </Text>
    </Flex>
  );
}
