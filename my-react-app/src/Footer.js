import React from "react";

const Footer = () => {
  const footerStyles = {
    footer: {
      backgroundColor: "black",
      color: "white",
      padding: "20px 0",
      textAlign: "center",
      fontSize: "14px",
      position: "relative",
      bottom: "0",
      width: "100%",
    },
    footerLinks: {
      color: "white",
      textDecoration: "none",
      margin: "0 10px",
      transition: "color 0.3s ease",
    },
    footerLinksHover: {
      color: "#6ca390", 
    },
  };

  return (
    <footer style={footerStyles.footer}>
      <div>
        <p>© 2024 DealSeeker. All rights reserved.</p>
        <div>
          <a
            href="#home"
            style={footerStyles.footerLinks}
            onMouseEnter={(e) => (e.target.style.color = footerStyles.footerLinksHover.color)}
            onMouseLeave={(e) => (e.target.style.color = footerStyles.footerLinks.color)}
          >
            Privacy Policy
          </a>
          |
          <a
            href="#home"
            style={footerStyles.footerLinks}
            onMouseEnter={(e) => (e.target.style.color = footerStyles.footerLinksHover.color)}
            onMouseLeave={(e) => (e.target.style.color = footerStyles.footerLinks.color)}
          >
            Terms of Service
          </a>
          |
          <a
            href="#home"
            style={footerStyles.footerLinks}
            onMouseEnter={(e) => (e.target.style.color = footerStyles.footerLinksHover.color)}
            onMouseLeave={(e) => (e.target.style.color = footerStyles.footerLinks.color)}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
