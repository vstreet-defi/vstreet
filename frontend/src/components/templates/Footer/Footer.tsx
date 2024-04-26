import vStreetLogoWhite from "../../../assets/images/icons/vStreet-Logo-White-Big.png";
function Footer() {
  return (
    <footer>
      <div className="legal-disclaimer">
        <h5>LEGAL DISCLAIMER</h5>
        <p>
          The information provided on this website does not constitute
          investment advice, financial advice, trading advice, or any other sort
          of advice and you should not treat any of the website's content as
          such. The vStreet team provides the website as a service to the
          public, and is not responsible for, and expressly disclaims all
          liability for, damages of any kind arising out of use, reference to,
          or reliance on any information contained within this website. While
          the information contained within this website is periodically updated,
          no guarantee is given that the information provided in this website is
          correct, complete, and up-to-date. vStreet
        </p>
      </div>
      <div className="rights">
        <img src={vStreetLogoWhite} alt="vStreet" />
        <br />
        <p>2024 © All rights reserved by vStreet</p>
        <br />
        <a href="mailto:contact@vstreet.io">contact@vstreet.io</a>
      </div>
    </footer>
  );
}

export { Footer };
