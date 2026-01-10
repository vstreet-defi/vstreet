import { Flex } from "@chakra-ui/react";

/**
 * ReadState Component (DEPRECATED)
 * This component relied on decodedVstreetMeta which is no longer exported.
 * Protocol stats are now fetched via Sails in VaultsManager/GlobalStatsBar.
 */
function ReadState() {
  return (
    <Flex>
      {/* Legacy state reader - functionality moved to VaultsManager */}
    </Flex>
  );
}

export { ReadState };
