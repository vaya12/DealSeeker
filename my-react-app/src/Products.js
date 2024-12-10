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
      description: "A stylish blouse made with high-quality materials."

    },
    {
      id: 2,
      name: "Zara blouse",
      price: "29.90 BGN",
      sizes: ["XS", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
      description: "A stylish blouse made with high-quality materials."

    },
    {
      id: 3,
      name: "Zara skirt",
      price: "39.90 BGN",
      sizes: ["S", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
      description: "A stylish blouse made with high-quality materials."

    },
    {
      id: 4,
      name: "Zara dress",
      price: "49.90 BGN",
      sizes: ["S", "M", "L"],
      link: "zara.com",
      image: "https://via.placeholder.com/200x200",
      description: "A stylish blouse made with high-quality materials."

    },
  ];

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4); 
  const [selectedProduct, setSelectedProduct] = useState(null);



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
    modal: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "20px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      zIndex: 1000,
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "transparent",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
    },
  };


  const handleVisibleCountChange = (event) => {
    setVisibleCount(Number(event.target.value));
  };


  const handleCardHover = (id) => {
    setHoveredCard(id);
  };

  

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <>
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
            onMouseEnter={() => setHoveredButton("price")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Price
          </button>
          <button
            style={{
              ...styles.sortButton,
              ...(hoveredButton === "latest" && styles.sortButtonHover),
            }}
            onMouseEnter={() => setHoveredButton("latest")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            Latest
          </button>
        </div>
  
        <div style={{ marginRight: "20px" }}>
          <label htmlFor="visibleCount" style={styles.sortLabel}>
            Show:
          </label>
          <select
            id="visibleCount"
            value={visibleCount}
            onChange={handleVisibleCountChange}
            style={{
              padding: "5px",
              fontSize: "16px",
              borderRadius: "5px",
              marginLeft: "10px",
            }}
          >
            <option value="2">2 Products</option>
            <option value="4">4 Products</option>
            <option value={products.length}>All Products</option>
          </select>
        </div>
      </div>
  
      <div style={styles.grid}>
        {products.slice(0, visibleCount).map((product) => (
          <div
            key={product.id}
            style={{
              ...styles.card,
              ...(hoveredCard === product.id && styles.cardHover),
            }}
            onMouseEnter={() => handleCardHover(product.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => openModal(product)}
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
                style={styles.detailsButton}
                onClick={() => openModal(product)}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#AFCBC4"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#000"}

              >
                Product Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
    {selectedProduct && (
    <>
        <div style={styles.overlay} onClick={closeModal}></div>
        <div style={{
                ...styles.modal,
                width: "60%", 
                textAlign: "center", 
                backgroundColor: "#FFF",
        }}>
        <button style={styles.closeButton} onClick={closeModal}>
            &times;
        </button>
        <div style={{
                display: "flex", 
                flexDirection: "row", 
                alignItems: "center",
                justifyContent: "space-between", 
                gap: "20px" 
        }}>
            <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name} 
            style={{
                width: "40%",
                borderRadius: "10px",
                objectFit: "cover",
            }} 
            />
            <div style={{
                    display: "flex",
                    flexDirection: "column", 
                    alignItems: "flex-start",
                    justifyContent: "center",
                    textAlign: "left",
                    gap: "10px", 
                    width: "55%",
            }}>
            <h2 style={{
                    fontSize: "32px",
                    color: "#000",
                    marginBottom: "10px"
            }}>{selectedProduct.name}</h2>
            <p style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#000",
                    marginBottom: "10px"
            }}>{selectedProduct.price}</p>
            <p style={{
                    fontSize: "16px",
                    color: "#000",
                    marginBottom: "20px"
            }}>{selectedProduct.description}</p>
            <a 
                href={`https://${selectedProduct.link}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                ...styles.detailsButton,
                textAlign: "center",
                transition: "background-color 0.2s",
                textDecoration: "none",
                width: "80%",
                justifyContent: "center",
            }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#AFCBC4"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#000"}
            >
                Go to the store
            </a>
            </div>
        </div>

        <h2
            style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#000",
                marginTop: "20px",
            }}>Deals
        </h2>
        <div
        key={selectedProduct.id}
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#AFCBC4",
            padding: "10px 15px",
            fontSize: "18px",
            fontWeight: "bold",
        }}
        >
        <span style={{ color: "#fff" }}>{selectedProduct.name}</span>
        <span style={{ color: "#fff" }}>{selectedProduct.price}</span>
        <a
            href={`https://${selectedProduct.link}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "10px 15px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#6CA390"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#000"}
        >
            {selectedProduct.link}
        </a>
        </div>
  
    </div>
    </>
    )}
  </>
)};

export default Products;
