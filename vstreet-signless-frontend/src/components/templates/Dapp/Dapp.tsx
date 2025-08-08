import { SignlessPanel } from '@/components/signless/SignlessPanel';
import { Heading } from '@chakra-ui/react';
import * as PropTypes from 'prop-types';

interface DappTemplateProps {
  bannerComponent: React.ReactNode;
  leftSectionComponent: React.ReactNode;
  rightSectionComponent: React.ReactNode;
}

function Dapp({ bannerComponent, leftSectionComponent, rightSectionComponent }: DappTemplateProps) {
  return (
    <>
      <div className="dapp-banner">{bannerComponent}</div>
      <SignlessPanel />
      <div className="section-container">
        <div className="left-section">{leftSectionComponent}</div>
        <div className="right-section">{rightSectionComponent}</div>
      </div>
    </>
  );
}

Dapp.propTypes = {
  bannerComponent: PropTypes.element.isRequired,
  leftSectionComponent: PropTypes.element.isRequired,
  rightSectionComponent: PropTypes.element.isRequired,
};

export default Dapp;
