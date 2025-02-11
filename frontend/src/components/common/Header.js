import React from "react";
import "./styles/Header.css";
import leftPhoto from "../../photos/header_left_photo.jpg";
import rightPhoto from "../../photos/header_right_photo.jpg";

const Header = () => {
  const styles = {
    header: {
      position: "relative",
      height: "80vh", 
      background: "linear-gradient(to left, black 50%, white 50%)",
      color: "white",
      fontFamily: "'Saira Stencil One', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    imagesContainer: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
    imageLeft: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "50%", 
      height: "85%", 
      objectFit: "cover",
    },
    imageRight: {
      position: "absolute",
      top: "0",
      right: "0",
      width: "40%",
      height: "85%",
      objectFit: "cover",
    },
    logo: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "48px",
      color: "white",
      zIndex: 2,
      background: "black",
      padding: "15px 15px",
      overflow: "visible",
    },
    blueRectangle: {
      position: "relative",
      left: "48%",
      top: "42%",
      width: "173px",
      height: "40px",
      background: "#AFCBC4",
      zIndex: 3,
    },
  
    tagline: {
      width: "100%",
      background: "black", 
      color: "white",
      fontSize: "25px",
      fontWeight: "normal",
      textAlign: "center",
      padding: "15px 0",
      position: "absolute",
      bottom: "0",
      left: "0",
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.imagesContainer}>
        <img src={leftPhoto} alt="Left Fashion" style={styles.imageLeft} />
          <div style={styles.blueRectangle}></div>
        <h1 style={styles.logo}>DealSeeker</h1>
        <img src={rightPhoto} alt="Right Fashion" style={styles.imageRight} />
      </div>
      <p style={styles.tagline}>
        Your One-Stop Destination for the Best Fashion Deals!
      </p>
    </header>
  );
};

export default Header;
