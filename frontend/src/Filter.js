import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 

const Filter = ({ onFilter }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [minPrice, setMinPrice] = useState(location.state?.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(location.state?.maxPrice || 300);
  const [selectedCategories, setSelectedCategories] = useState(location.state?.categories || []);
  const [selectedColors, setSelectedColors] = useState(location.state?.colors || []);
  const [selectedSizes, setSelectedSizes] = useState(location.state?.sizes || []);
  const [selectedBrands, setSelectedBrands] = useState(location.state?.brands || []);
  
  const [expandedSections, setExpandedSections] = useState([
    "category",
    "color",
    "size",
    "brand",
    "price"
  ]);

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  useEffect(() => {
    if (location.state) {
      const filters = {
        categories: location.state.categories || [],
        colors: location.state.colors || [],
        sizes: location.state.sizes || [],
        brands: location.state.brands || [],
        minPrice: location.state.minPrice || 0,
        maxPrice: location.state.maxPrice || 300,
      };
      onFilter(filters);
    }
  }, [location.state, onFilter]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const brandsResponse = await fetch('/api/brands');
        const brandsData = await brandsResponse.json();
        setAvailableBrands(brandsData);

        const colorsResponse = await fetch('/api/colors');
        const colorsData = await colorsResponse.json();
        setAvailableColors(colorsData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  const categories = ["clothes", "bags", "shoes", "accessories"];
  const sizes = ["XS", "S", "M", "L", "XL"];

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const toggleSelection = (value, selectedValues, setSelectedValues) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleFilter = () => {
    const filters = {
      categories: selectedCategories,
      colors: selectedColors,
      sizes: selectedSizes,
      brands: selectedBrands,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || 300
    };
    
    console.log('Sending filters:', filters);
    onFilter(filters);
    navigate("/products", { state: filters });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(300);
    
    const emptyFilters = {
      categories: [],
      colors: [],
      sizes: [],
      brands: [],
      minPrice: 0,
      maxPrice: 300,
    };
    onFilter(emptyFilters);
    navigate("/products", { state: emptyFilters });
  };

  const hasActiveFilters = () => {
    return selectedCategories.length > 0 ||
           selectedColors.length > 0 ||
           selectedSizes.length > 0 ||
           selectedBrands.length > 0 ||
           minPrice > 0 ||
           maxPrice > 0;
  };

  const styles = {
    container: {
      padding: "15px",
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      maxWidth: "300px",
      fontFamily: "Arial, sans-serif",
    },
    arrow: {
      fontSize: "12px",
      marginRight: "5px"
    },
    section: {
      marginBottom: "15px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "bold",
      margin: 0,
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    options: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "10px",
    },
    item: {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "10px 15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "all 0.3s",
      fontSize: "14px",
      backgroundColor: "#fff",
    },
    itemHover: {
      backgroundColor: "#f0f0f0",
    },
    itemActive: {
      backgroundColor: "#6ca390",
      color: "white",
      cursor: "default", 
    },
    colorBox: {
      width: "40px",
      height: "40px",
      borderRadius: "5px",
      cursor: "pointer",
      border: "1px solid transparent",
      transition: "all 0.3s",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)"
    },
    colorBoxActive: {
      border: "2px solid #6ca390",
      cursor: "default", 
    },
    range: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "10px",
    },
    button: {
      width: "100%",
      backgroundColor: "#6ca390",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    buttonHover: {
      backgroundColor: "#55826e",
    },
    clearButton: {
      width: "100%",
      backgroundColor: "#f0f0f0",
      color: "#333",
      fontSize: "14px",
      padding: "8px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
      transition: "background-color 0.3s",
    },
    clearButtonHover: {
      backgroundColor: "#bbb",
    },
    priceRangeContainer: {
      padding: "15px 10px",
    },
    priceInputs: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "15px",
    },
    priceInputGroup: {
      display: "flex",
      alignItems: "center",
      flex: "1",
    },
    priceInput: {
      width: "70px",
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      marginRight: "5px",
    },
    currencyLabel: {
      fontSize: "14px",
      color: "#666",
    },
    priceSeparator: {
      margin: "0 10px",
      color: "#666",
    },
  };

  return (
    <div className="filter-section" style={styles.container}>
      <div style={styles.section}>
        <h2 style={styles.title} onClick={() => toggleSection("category")}>
          Category <span style={styles.arrow}>{expandedSections.includes("category") ? "▼" : "▶"}</span>
        </h2>
        {expandedSections.includes("category") && (
          <div style={styles.options}>
            {categories.map((category) => (
              <div
                key={category}
                style={{
                  ...styles.item,
                  ...(selectedCategories.includes(category) && styles.itemActive),
                }}
                onMouseEnter={(e) => {
                  if (!selectedCategories.includes(category)) {
                    e.target.style.backgroundColor = styles.itemHover.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedCategories.includes(category)) {
                    e.target.style.backgroundColor = styles.item.backgroundColor;
                  }
                }}
                onClick={() =>
                  toggleSelection(category, selectedCategories, setSelectedCategories)
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={styles.section}>
        <h2 style={styles.title} onClick={() => toggleSection("color")}>
          Color <span style={styles.arrow}>{expandedSections.includes("color") ? "▼" : "▶"}</span>
        </h2>
        {expandedSections.includes("color") && (
          <div style={styles.options}>
            {availableColors.map((color) => (
              <div
                key={color.hex_code}
                style={{
                  ...styles.colorBox,
                  backgroundColor: color.hex_code,
                  ...(selectedColors.includes(color.hex_code) && styles.colorBoxActive),
                }}
                onClick={() => toggleSelection(color.hex_code, selectedColors, setSelectedColors)}
                title={color.name}
              ></div>
            ))}
          </div>
        )}
      </div>
      <div style={styles.section}>
        <h2 style={styles.title} onClick={() => toggleSection("size")}>
          Size <span style={styles.arrow}>{expandedSections.includes("size") ? "▼" : "▶"}</span>
        </h2>
        {expandedSections.includes("size") && (
          <div style={styles.options}>
            {sizes.map((size) => (
              <div
                key={size}
                style={{
                  ...styles.item,
                  ...(selectedSizes.includes(size) && styles.itemActive),
                }}
                onMouseEnter={(e) => {
                  if (!selectedSizes.includes(size)) {
                    e.target.style.backgroundColor = styles.itemHover.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedSizes.includes(size)) {
                    e.target.style.backgroundColor = styles.item.backgroundColor;
                  }
                }}
                onClick={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
              >
                {size}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={styles.section}>
        <h2 style={styles.title} onClick={() => toggleSection("brand")}>
          Brand <span style={styles.arrow}>{expandedSections.includes("brand") ? "▼" : "▶"}</span>
        </h2>
        {expandedSections.includes("brand") && (
          <div style={styles.options}>
            {availableBrands.map((brand) => (
              <div
                key={brand}
                style={{
                  ...styles.item,
                  ...(selectedBrands.includes(brand) && styles.itemActive),
                }}
                onMouseEnter={(e) => {
                  if (!selectedBrands.includes(brand)) {
                    e.target.style.backgroundColor = styles.itemHover.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedBrands.includes(brand)) {
                    e.target.style.backgroundColor = styles.item.backgroundColor;
                  }
                }}
                onClick={() => toggleSelection(brand, selectedBrands, setSelectedBrands)}
              >
                {brand}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={styles.section}>
        <h2 style={styles.title} onClick={() => toggleSection("price")}>
          Price Range <span style={styles.arrow}>{expandedSections.includes("price") ? "▼" : "▶"}</span>
        </h2>
        {expandedSections.includes("price") && (
          <div style={styles.priceRangeContainer}>
            <div style={styles.priceInputs}>
              <div style={styles.priceInputGroup}>
                <input
                  type="number"
                  min="0"
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value <= maxPrice) {
                      setMinPrice(value);
                    }
                  }}
                  style={styles.priceInput}
                  placeholder="Min"
                />
                <span style={styles.currencyLabel}>BGN</span>
              </div>
              <span style={styles.priceSeparator}>-</span>
              <div style={styles.priceInputGroup}>
                <input
                  type="number"
                  min={minPrice}
                  max="1000"
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= minPrice) {
                      setMaxPrice(value);
                    }
                  }}
                  style={styles.priceInput}
                  placeholder="Max"
                />
                <span style={styles.currencyLabel}>BGN</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters() && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "10px", 
          borderRadius: "5px", 
          fontSize: "14px"
        }}>
          Active filters: {[
            selectedCategories.length && `${selectedCategories.length} categories`,
            selectedColors.length && `${selectedColors.length} colors`,
            selectedSizes.length && `${selectedSizes.length} sizes`,
            selectedBrands.length && `${selectedBrands.length} brands`,
            minPrice > 0 && `Price from ${minPrice} BGN`,
            maxPrice > 0 && `Price up to ${maxPrice} BGN`
          ].filter(Boolean).join(", ")}
        </div>
      )}

      <button
        style={styles.button}
        onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
        onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
        onClick={handleFilter}
      >
        Apply Filters
      </button>
      <button
        style={styles.clearButton}
        onMouseEnter={(e) => (e.target.style.backgroundColor = styles.clearButtonHover.backgroundColor)}
        onMouseLeave={(e) => (e.target.style.backgroundColor = styles.clearButton.backgroundColor)}
        onClick={clearFilters}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default Filter;
