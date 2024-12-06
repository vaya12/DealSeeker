import React, { useState } from "react";

const Filter = () => {
  const [price, setPrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);


  const styles = {
    filtersPage: {
      padding: "20px",
      backgroundColor: "white",
      color: "black",
      fontFamily: "'Arial', sans-serif",
      margin: "80px",
    },
    filtersTitle: {
      fontSize: "24px",
      marginBottom: "25px",
    },
    section: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
      gap: "60px",
      marginBottom: "50px",
    },
    item: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",
      padding: "10px",
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    itemHover: {
      backgroundColor: "#e0e0e0",
    },
    itemActive: {
      border: "2px solid black",
    },
    colorBox: {
      width: "50px",
      height: "50px",
      borderRadius: "5px",
      cursor: "pointer",
      border: "1px solid transparent",
      transition: "all 0.3s ease",
    },
    colorBoxActive: {
      border: "2px solid black",
    },
    priceRange: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "20px",
    },
    rangeSlider: {
      width: "100%",
      margin: "10px 0",
    },

    priceValue: {
      fontSize: "16px",
      marginTop: "5px",
      marginBottom: "10px",
    },
    filterButton: {
      backgroundColor: "#6ca390",
      color: "white",
      fontSize: "25px",
      fontFamily: "'Saira Stencil One', sans-serif",
      padding: "15px 100px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    filterButtonHover: {
      backgroundColor: "#5a887a",
    },
    
  };

  return (
    <div style={styles.filtersPage}>
      <h1 style={styles.filtersTitle}>Category</h1>
      <div style={styles.section}>
        {["Shoes", "Bags", "Clothes", "Accessories"].map((category) => (
          <div
            key={category}
            style={{
              ...styles.item,
              ...(selectedCategory === category && styles.itemActive),
            }}
            onClick={() => setSelectedCategory(category)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          >
            {category}
          </div>
        ))}
      </div>

      <h2 style={styles.filtersTitle}>Color</h2>
      <div style={styles.section}>
        {["#c7eb91", "#000", "#71a79f", "#dda3d1", "#e7f054", "#e0e0e0", "#441852", "#62E76B"].map(
          (color) => (
            <div
              key={color}
              style={{
                ...styles.colorBox,
                backgroundColor: color,
                ...(selectedColor === color && styles.colorBoxActive),
              }}
              onClick={() => setSelectedColor(color)}
            ></div>
          )
        )}
      </div>

      <h2 style={styles.filtersTitle}>Size</h2>
      <div style={styles.section}>
        {["XS", "S", "M", "L", "XL"].map((size) => (
          <div
            key={size}
            style={{
              ...styles.item,
              ...(selectedSize === size && styles.itemActive),
            }}
            onClick={() => setSelectedSize(size)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
          >
            {size}
          </div>
        ))}
      </div>

      <h2 style={styles.filtersTitle}>Brand</h2>
      <div style={styles.section}>
        {["Nike", "Adidas", "Puma", "Reebok", "New Balance"].map((brand) => (
          <div
            key={brand}
            style={{
              ...styles.item,
              ...(selectedBrand === brand && styles.itemActive),
            }}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </div>
        ))}
      </div>

      <h2 style={styles.filtersTitle}>Price Range</h2>
      <div style={styles.priceRange}>
        <input
          type="range"
          min="0"
          max="100"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.rangeSlider}
        />
        <span style={styles.priceValue}>{price} BGN</span>
      </div>

      <button
        style={styles.filterButton}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#5a887a")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#6ca390")}
      >
        Filter
      </button>
    </div>
  );
};

export default Filter;
