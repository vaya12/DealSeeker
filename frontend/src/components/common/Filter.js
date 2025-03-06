import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Filter = ({ onFilter }) => {
    const navigate = useNavigate();
    
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(300);

    const [expandedSections, setExpandedSections] = useState([
        "category", "color", "size", "brand", "price"
    ]);

    const [availableCategories, setAvailableCategories] = useState([]);

    const fetchInitialData = useCallback(async () => {
        try {
            console.log("Fetching initial data..."); 
            const response = await fetch('/api/available-filters');
            
            if (!response.ok) {
                throw new Error('Failed to fetch filters');
            }

            const data = await response.json();
            console.log("Received filter data:", data);

            if (data) {
                if (data.merchants && Array.isArray(data.merchants)) {
                    setAvailableBrands(data.merchants);
                }

                if (data.colors && Array.isArray(data.colors)) {
                    const formattedColors = data.colors.map(color => ({
                        id: color.id,
                        hex_code: color.hex_code || '#000000',
                        name: color.name
                    }));
                    setAvailableColors(formattedColors);
                }
                
                if (data.sizes && Array.isArray(data.sizes)) {
                    const formattedSizes = data.sizes.map(size => size.name || size);
                    setAvailableSizes(formattedSizes);
                }

                if (data.priceRange) {
                    setMinPrice(parseFloat(data.priceRange.min) || 0);
                    setMaxPrice(parseFloat(data.priceRange.max) || 300);
                }

                if (data.categories && Array.isArray(data.categories)) {
                    setAvailableCategories(data.categories);
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setAvailableBrands([]);
            setAvailableColors([]);
            setAvailableSizes([]);
        }
    }, []);

    const toggleSelection = useCallback((value, type) => {
        console.log(`Toggling ${type}:`, value);
        
        const setters = {
            category: setSelectedCategories,
            color: setSelectedColors,
            size: setSelectedSizes,
            brand: setSelectedBrands
        };

        setters[type](prev => {
            const newSelection = prev.includes(value) ? [] : [value];
            console.log(`New ${type} selection:`, newSelection);
            return newSelection;
        });
    }, []);

    const toggleSection = (section) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const applyFilters = useCallback(() => {
        const filters = {
            categories: selectedCategories,
            colors: selectedColors,
            sizes: selectedSizes,
            brands: selectedBrands,
            minPrice: Number(minPrice),
            maxPrice: Number(maxPrice)
        };
        onFilter(filters);
        navigate("/products", { state: filters });
    }, [selectedCategories, selectedColors, selectedSizes, selectedBrands, minPrice, maxPrice, navigate, onFilter]);

    const clearFilters = useCallback(() => {
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
            maxPrice: 300
        };
        onFilter(emptyFilters);
        navigate("/products", { state: emptyFilters });
        
        fetchInitialData();
    }, [fetchInitialData, navigate, onFilter]);

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
        noOptionsMessage: {
            color: "#999",
            fontStyle: "italic",
            marginTop: "10px",
        },
    };

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return (
        <div className="filter-section" style={styles.container}>
            <div style={styles.section}>
                <h2 style={styles.title} onClick={() => toggleSection("category")}>
                    Categories <span style={styles.arrow}>{expandedSections.includes("category") ? "▼" : "▶"}</span>
                </h2>
                {expandedSections.includes("category") && (
                    <div style={styles.options}>
                        {availableCategories.length === 0 ? (
                            <div style={styles.noOptionsMessage}>No categories available</div>
                        ) : (
                            availableCategories.map((category, index) => (
                                <div
                                    key={`category-${category.id}-${index}`}
                                    style={{
                                        ...styles.item,
                                        ...(selectedCategories.includes(category.id?.toString()) && styles.itemActive)
                                    }}
                                    onClick={() => toggleSelection(category.id?.toString(), 'category')}
                                >
                                    {category.name} ({category.product_count})
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div style={styles.section}>
                <h2 style={styles.title} onClick={() => toggleSection("color")}>
                    Color <span style={styles.arrow}>{expandedSections.includes("color") ? "▼" : "▶"}</span>
                </h2>
                {expandedSections.includes("color") && (
                    <div style={styles.options}>
                        {availableColors.length === 0 ? (
                            <div style={styles.noOptionsMessage}>No colors available for selected filters</div>
                        ) : (
                            availableColors.map((color, index) => (
                                <div
                                    key={`color-${color.id}-${index}`}
                                    style={{
                                        ...styles.colorBox,
                                        backgroundColor: color.hex_code,
                                        ...(selectedColors.includes(color.hex_code) && styles.colorBoxActive),
                                    }}
                                    onClick={() => toggleSelection(color.hex_code, 'color')}
                                    title={color.name}
                                ></div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div style={styles.section}>
                <h2 style={styles.title} onClick={() => toggleSection("size")}>
                    Size <span style={styles.arrow}>{expandedSections.includes("size") ? "▼" : "▶"}</span>
                </h2>
                {expandedSections.includes("size") && (
                    <div style={styles.options}>
                        {availableSizes.length === 0 ? (
                            <div style={styles.noOptionsMessage}>No sizes available for selected filters</div>
                        ) : (
                            availableSizes.map((size, index) => (
                                <div
                                    key={`size-${size}-${index}`}
                                    style={{
                                        ...styles.item,
                                        ...(selectedSizes.includes(size) && styles.itemActive),
                                    }}
                                    onClick={() => toggleSelection(size, 'size')}
                                >
                                    {size}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div style={styles.section}>
                <h2 style={styles.title} onClick={() => toggleSection("brand")}>
                    Brand <span style={styles.arrow}>{expandedSections.includes("brand") ? "▼" : "▶"}</span>
                </h2>
                {expandedSections.includes("brand") && (
                    <div style={styles.options}>
                        {availableBrands.length === 0 ? (
                            <div style={styles.noOptionsMessage}>No brands available</div>
                        ) : (
                            availableBrands.map((brand, index) => (
                                <div
                                    key={`brand-${brand.id}-${index}`}
                                    style={{
                                        ...styles.item,
                                        ...(selectedBrands.includes(brand.id?.toString()) && styles.itemActive)
                                    }}
                                    onClick={() => toggleSelection(brand.id?.toString(), 'brand')}
                                >
                                    {brand.name} ({brand.product_count})
                                </div>
                            ))
                        )}
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

            {(selectedCategories.length > 0 ||
                selectedColors.length > 0 ||
                selectedSizes.length > 0 ||
                selectedBrands.length > 0 ||
                minPrice > 0 ||
                maxPrice < 300) && (
                    <div style={{ 
                        padding: "10px", 
                        marginBottom: "10px", 
                        borderRadius: "5px", 
                        fontSize: "14px"
                    }}>
                        Active filters: {[
                            selectedCategories.length ? `${selectedCategories.length} categories` : '',
                            selectedColors.length ? `${selectedColors.length} colors` : '',
                            selectedSizes.length ? `${selectedSizes.length} sizes` : '',
                            selectedBrands.length ? `${selectedBrands.length} brands` : '',
                            minPrice > 0 ? `Price from ${minPrice} BGN` : '',
                            maxPrice < 300 ? `Price up to ${maxPrice} BGN` : ''
                        ].filter(Boolean).join(", ")}
                    </div>
                )}

            <button 
                style={styles.button} 
                onClick={applyFilters}
            >
                Apply Filters
            </button>
            
            {(selectedCategories.length > 0 ||
              selectedColors.length > 0 ||
              selectedSizes.length > 0 ||
              selectedBrands.length > 0 ||
              minPrice > 0 ||
              maxPrice < 300) && (
                <button 
                    style={styles.clearButton}
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default Filter;
