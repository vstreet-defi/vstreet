import xIcon from "../../../assets/images/icons/x-social-media-white-icon.png";
import discordIcon from "../../../assets/images/icons/discord-icon.png";
import linkedinIcon from "../../../assets/images/icons/linkedin-icon.png";
import githubIcon from "../../../assets/images/icons/github-icon.png";
//import gitbookIcon from "../../../assets/images/icons/gitbook-icon.png";

function SocialMedia() {
  return (
    <div className="social-media" id="social">
      <h3>Follow Us</h3>
      <p>
        Engage with a community of sophisticated web3 investors and create smart
        DeFi strategies on top of the fastest blockchain.
      </p>
      <div className="social-icons-container">
        <img
          src={xIcon}
          onClick={() =>
            window.open("https://twitter.com/vstreet_io", "_blank")
          }
          alt="x-icon"
        />
        <img
          src={discordIcon}
          onClick={() => window.open("https://discord.gg/cF4Fk5WY", "_blank")}
          alt=""
        />
        <img
          src={linkedinIcon}
          onClick={() =>
            window.open(
              "https://www.linkedin.com/in/vstreet-de-fi-615449304/",
              "_blank"
            )
          }
          alt=""
        />
        <img
          src={githubIcon}
          onClick={() =>
            window.open("https://github.com/vstreet-defi/vstreet", "_blank")
          }
          alt=""
        />
        {/* <img
          src={gitbookIcon}
          // onClick={() => window.open("", "_blank")}
          alt=""
        /> */}
      </div>
    </div>
  );
}

export default SocialMedia;
