import xIcon from "../../../assets/images/icons/x-social-media-white-icon.png";
import discordIcon from "../../../assets/images/icons/discord-icon.png";
import linkedinIcon from "../../../assets/images/icons/linkedin-icon.png";
import githubIcon from "../../../assets/images/icons/github-icon.png";
//import gitbookIcon from "../../../assets/images/icons/gitbook-icon.png";

const socialMediaLinks = [
  {
    icon: xIcon,
    alt: "x-icon",
    url: "https://twitter.com/vstreet_io",
  },
  {
    icon: discordIcon,
    alt: "discord-icon",
    url: "https://discord.gg/jBMqWd8kET",
  },
  {
    icon: linkedinIcon,
    alt: "linkedin-icon",
    url: "https://www.linkedin.com/in/vstreet-de-fi-615449304/",
  },
  {
    icon: githubIcon,
    alt: "github-icon",
    url: "https://github.com/vstreet-defi/vstreet",
  },
  // { icon: gitbookIcon, alt: "gitbook-icon", url: "https://gitbook-url" }
];

function SocialMedia() {
  return (
    <div className="social-media" id="social">
      <h3>Follow Us</h3>
      <p>
        Engage with a community of sophisticated web3 investors and create smart
        DeFi strategies on top of the fastest blockchain.
      </p>
      <div className="social-icons-container">
        {socialMediaLinks.map(({ icon, alt, url }) => (
          <img
            key={alt}
            src={icon}
            onClick={() => window.open(url, "_blank")}
            alt={alt}
          />
        ))}
      </div>
    </div>
  );
}

export default SocialMedia;
