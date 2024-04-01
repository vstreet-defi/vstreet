import * as PropTypes from "prop-types";

interface DappTemplateProps {
  bannerComponent: React.ReactNode;
  leftSectionComponent: React.ReactNode;
  rightSectionComponent: React.ReactNode;
}

function Dapp({
  bannerComponent,
  leftSectionComponent,
  rightSectionComponent,
}: DappTemplateProps) {
  return (
    <>
      <div className="dapp-banner">{bannerComponent}</div>
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
