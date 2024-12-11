import React, { useState, useEffect } from "react";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [visibleCount, setVisibleCount] = useState(4);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetch("/products_catalogue.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch products data");
                }
                return response.json();
            })
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error loading JSON:", error));
    }, []);

    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: "15px 30px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        title: {
            fontFamily: "'Saira Stencil One', sans-serif",
            fontSize: "32px",
            color: "#fff",
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            padding: "20px 30px",
        },
        card: {
            border: "1px solid #ddd",
            borderRadius: "15px",
            overflow: "hidden",
            cursor: "pointer",
            textAlign: "center",
            padding: "15px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            backgroundColor: "#f9f9f9",
        },
        cardHover: {
            transform: "scale(1.05)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        },
        image: {
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "10px",
        },
        name: {
            fontSize: "18px",
            fontWeight: "bold",
            margin: "10px 0 5px 0",
            color: "#333",
        },
        price: {
            fontSize: "16px",
            color: "#555",
        },
        size: {
            fontSize: "14px",
            color: "#777",
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

    const handleCardHover = (id) => {
        setHoveredCard(id);
    };

    const openModal = (product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const handleVisibleCountChange = (event) => {
        setVisibleCount(Number(event.target.value));
    };

    return (
        <>
            <header style={styles.header}>
                <h1 style={styles.title}>Products</h1>
                <div>
                    <label htmlFor="visibleCount">Show:</label>
                    <select
                        id="visibleCount"
                        value={visibleCount}
                        onChange={handleVisibleCountChange}
                        style={{ marginLeft: "10px", padding: "5px" }}
                    >
                        <option value="2">2 Products</option>
                        <option value="4">4 Products</option>
                        <option value={products.length}>All Products</option>
                    </select>
                </div>
            </header>
            <div style={styles.grid}>
                {products.slice(0, visibleCount).map((product, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.card,
                            ...(hoveredCard === product.id ? styles.cardHover : {}),
                        }}
                        onMouseEnter={() => handleCardHover(product.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <img
                            src={product.image || "https://via.placeholder.com/240"}
                            alt={product.name}
                            style={styles.image}
                        />
                        <h3 style={styles.name}>{product.name}</h3>
                        <p style={styles.price}>
                            {Array.isArray(product.price) && product.price.length === 1
                                ? `At ${product.price[0].store}: ${product.price[0].price}`
                                : Array.isArray(product.price) && product.price.length > 1
                                ? `From ${product.price[0].price || "N/A"} in ${product.price.length} store(s)`
                                : "Price not available"}
                        </p>
                        <p style={styles.size}>
                            Available sizes: {product.size?.length ? product.size.join(", ") : "No sizes available"}
                        </p>
                        <button
                            style={styles.detailsButton}
                            onClick={() => openModal(product)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#AFCBC4"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#000"}
                        >
                            Product Details
                        </button>
                    </div>
                ))}
            </div>


        {selectedProduct && (
            <>
                <div style={styles.overlay} onClick={closeModal} />
                <div style={styles.modal}>
                    <button style={styles.closeButton} onClick={closeModal}>
                        &times;
                    </button>
                    <img
                        src={selectedProduct.image || "https://via.placeholder.com/240"}
                        alt={selectedProduct.name}
                        style={styles.image}
                    />
                    <h2 style={styles.name}>{selectedProduct.name}</h2>
                    <p>{selectedProduct.description}</p>
                    <p style={styles.price}>
                        {selectedProduct.price?.length === 1
                            ? `${selectedProduct.price[0].store}: ${selectedProduct.price[0].price}`
                            : `From ${selectedProduct.price?.[0]?.price || "N/A"} in ${selectedProduct.price?.length || 0} store(s)`}
                    </p>
                    <p style={styles.size}>
                        Available sizes: {selectedProduct.size?.length ? selectedProduct.size.join(", ") : "No sizes available"}
                    </p>
                </div>
            </>
        )}

        </>
    );
};

export default Products;
