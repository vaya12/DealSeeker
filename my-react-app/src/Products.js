import React, { useState } from "react";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Zara blouse",
      price: "29.90 BGN",
      sizes: ["S", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: 2,
      name: "Zara blouse",
      price: "29.90 BGN",
      sizes: ["XS", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: 3,
      name: "Zara skirt",
      price: "39.90 BGN",
      sizes: ["S", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: 4,
      name: "Zara dress",
      price: "49.90 BGN",
      sizes: ["S", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
    },
  ];

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const styles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      backgroundColor: "black",
      width: "100%",
    },
    title: {
      fontFamily: "'Saira Stencil One', sans-serif",
      fontSize: "36px",
      color: "white",
      marginLeft: "15px",
    },
    sortContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    sortLabel: {
      fontFamily: "'Saira Stencil One', sans-serif",
      fontSize: "18px",
      fontWeight: "bold",
      color: "white",
    },
    sortButton: {
      padding: "10px 15px",
      backgroundColor: "#AFCBC4",
      border: "none",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginRight: "15px",
      borderRadius: "10px",
      transition: "background-color 0.2s",
    },
    sortButtonHover: {
      backgroundColor: "#6CA390",
      color: "black",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      margin: "30px",
    },
    card: {
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      cursor: "pointer",
      textAlign: "left", 
      padding: "15px",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardHover: {
      backgroundColor: "#f5f5f5",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    image: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
    },
    info: {
      padding: "10px",
    },
    namePriceContainer: {
      display: "flex",
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: "10px",
    },

    name: {
      fontSize: "20px",
      margin: "0",
    },
    price: {
      fontWeight: "bold",
    },
    text: {
      margin: "5px 0",
    },
    link: {
      textDecoration: "none",
      color: "#000",
      display: "block",
    },
    detailsButton: {
      marginTop: "10px",
      padding: "10px 10px",
      backgroundColor: "black",
      color: "white",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s",
      width: "100%",
      borderRadius: "10px",
      fontWeight: "bold",
    },
    detailsButtonHover: {
      backgroundColor: "#6CA390",
      color: "white",
    },
  };

  const handleCardHover = (id) => {
    setHoveredCard(id);
  };

  const handleButtonHover = (id) => {
    setHoveredButton(id);
  };

  return (
    <section>
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        <div style={styles.sortContainer}>
          <span style={styles.sortLabel}>Sort by:</span>
          <button
            style={{
              ...styles.sortButton,
              ...(hoveredButton === "price" && styles.sortButtonHover),
            }}
            onMouseEnter={() => handleButtonHover("price")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Price
          </button>
          <button
            style={{
              ...styles.sortButton,
              ...(hoveredButton === "latest" && styles.sortButtonHover),
            }}
            onMouseEnter={() => handleButtonHover("latest")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Latest
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              ...styles.card,
              ...(hoveredCard === product.id && styles.cardHover),
            }}
            onMouseEnter={() => handleCardHover(product.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => alert(`You clicked on ${product.name}`)}
          >
            <img
              src={product.image}
              alt={product.name}
              style={styles.image}
            />
            <div style={styles.info}>
                <div style={styles.namePriceContainer}>
                    <h3 style={styles.name}>{product.name}</h3>
                    <p style={styles.price}>{product.price}</p>
                </div>
              <a
                href={`https://${product.link}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {product.link}
              </a>
              <p style={styles.text}>{product.sizes.join(" | ")}</p>
              <button
                style={{
                  ...styles.detailsButton,
                  ...(hoveredButton === `details-${product.id}` &&
                    styles.detailsButtonHover),
                }}
                onMouseEnter={() => handleButtonHover(`details-${product.id}`)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Product Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;
