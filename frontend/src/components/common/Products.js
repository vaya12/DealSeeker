import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProductModal from './ProductModal';
import { useLocation } from "react-router-dom";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [loading, setLoading] = useState(true);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const location = useLocation();

    const itemsPerPageOptions = [
        { value: 6, label: '6 products' },
        { value: 12, label: '12 products' },
        { value: 15, label: '15 products' },
        { value: 18, label: '18 products' }
    ];

    const hasRequiredProps = (product) => {
        return (
            product.id &&
            product.name &&
            product.category_id !== undefined &&
            Array.isArray(product.prices) &&
            Array.isArray(product.available_colors) &&
            Array.isArray(product.available_sizes)
        );
    };

    const filteredProducts = useMemo(() => {
        if (!products || !Array.isArray(products)) return [];
        
        return products.filter(product => {
            if (!product || !hasRequiredProps(product)) return false;

            if (selectedCategory !== "all" && 
                product.category_name.toLowerCase() !== selectedCategory.toLowerCase()) {
                return false;
            }

            return true;
        });
    }, [products, selectedCategory]);

    const fetchProducts = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            
            const {
                categories = [],
                colors = [],
                sizes = [],
                brands = [],
                minPrice = 0,
                maxPrice = 300
            } = filters || {};

            const queryParams = new URLSearchParams();
            
            if (categories.length) queryParams.append('categories', categories.join(','));
            if (colors.length) queryParams.append('colors', colors.join(','));
            if (sizes.length) queryParams.append('sizes', sizes.join(','));
            if (brands.length) queryParams.append('brands', brands.join(','));
            if (minPrice) queryParams.append('minPrice', minPrice);
            if (maxPrice) queryParams.append('maxPrice', maxPrice);

            const response = await fetch(`/api/products?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
            setNoResults(data.length === 0);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setNoResults(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const filters = location.state || {};
        fetchProducts(filters);
    }, [location.state, fetchProducts]);

    const handleFilter = () => {
        fetchProducts();
    };

    console.log("No results:", noResults);

    const dropdownStyles = {
        select: {
            appearance: "none",
            padding: "12px 40px 12px 20px",
            fontSize: "16px",
            fontWeight: "500",
            color: "#333",
            backgroundColor: "#fff",
            border: "2px solid #e0e0e0",
            borderRadius: "25px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%23333'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 15px center",
            minWidth: "200px",
            "&:hover": {
                backgroundColor: "#f5f5f5"
            },
            "&:focus": {
                outline: "none",
                borderColor: "#666",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }
        },
        wrapper: {
            position: "relative",
            marginRight: "15px"
        }
    };

    const sortOptions = [
        { value: "", label: "Sort by" },
        { value: "highToLow", label: "Price: High to Low" },
        { value: "lowToHigh", label: "Price: Low to High" }
    ];

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "clothes", label: "Clothes" },
        { value: "shoes", label: "Shoes" },
        { value: "accessories", label: "Accessories" },
        { value: "bags", label: "Bags" }
    ];

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setCurrentPage(1); 
    };

    const handleItemsPerPageChange = (event) => {
        const newItemsPerPage = parseInt(event.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const productsToShow = filteredProducts
        .sort((a, b) => {
            if (sortOption === "lowToHigh") {
                return parseFloat(a.max_price) - parseFloat(b.max_price);
            } else if (sortOption === "highToLow") {
                return parseFloat(b.max_price) - parseFloat(a.max_price);
            }
            return 0;
        });

    const totalPages = Math.ceil(productsToShow.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShowPaginated = productsToShow.slice(startIndex, endIndex);


    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            backgroundColor: "#000",
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
            gridTemplateColumns: "repeat(auto-fill, 300px)",
            gap: "20px",
            padding: "20px 30px",
            justifyContent: "center",
        },
        card: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: "15px",
            overflow: "hidden",
            cursor: "pointer",
            padding: "0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            width: "300px",
            height: "480px",
            position: "relative",
        },
        cardHover: {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        },
        imageContainer: {
            width: "100%",
            height: "300px",
            position: "relative",
            backgroundColor: "#f8f8f8",
            overflow: "hidden",
        },
        image: {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "transform 0.3s ease",
        },
        contentContainer: {
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        name: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1a1a1a",
            margin: "0",
            textAlign: "center",
        },
        priceContainer: {
            fontSize: "16px",
            fontWeight: "500",
            color: "#1a1a1a",
            margin: "0",
            textAlign: "center",
        },
        infoRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
        },
        sizesAndStoresRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        colorsAndAvailabilityRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        label: {
            fontSize: "14px",
            color: "#1a1a1a",
            margin: "0",
        },
        value: {
            fontSize: "14px",
            color: "#666",
            margin: "0",
        },
        colorRow: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        sizesContainer: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
        },
        storesInfo: {
            fontSize: "14px",
            color: "#666",
            margin: "0",
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
        },
        colorsContainer: {
            margin: "8px 0",
        },
        colorsTitle: {
            fontSize: "14px",
            color: "#1a1a1a",
            fontWeight: "600",
            margin: "0 0 4px 0",
        },
        colorsWrapper: {
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
        },
        colorCircle: {
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid #ddd",
        },
        detailsButton: {
            width: "100%",
            padding: "12px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "0 0 15px 15px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease",
            marginTop: "auto",
        },
        cardSaleLogo: {
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "50px",
            height: "50px",
            objectFit: "contain",
            zIndex: "1",
        },
        pagination: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "50px",
            gap: "10px"
        },
        pageButton: {
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            "&:hover": {
                backgroundColor: "#f0f0f0"
            }
        },
        pageButtonActive: {
            backgroundColor: "#000",
            color: "#fff",
            borderColor: "#000"
        },
        pageButtonDisabled: {
            backgroundColor: "#f0f0f0",
            cursor: "not-allowed",
            opacity: 0.5
        },
        controlsContainer: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            margin: "5px 0",
        },
        select: {
            appearance: "none",
            padding: "6px 25px 6px 12px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#333",
            backgroundColor: "#000",
            border: "1px solid #ddd",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%23333'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            backgroundSize: "14px",
            minWidth: "110px",
            "&:hover": {
                borderColor: "#afcbc4",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            },
            "&:focus": {
                outline: "none",
                borderColor: "#afcbc4",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }
        },
        wrapper: {
            position: "relative",
            marginRight: "8px"
        }

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

    if (loading) return <div>Loading...</div>;
    if (noResults) {
        return (
            <div style={styles.noResults}>
                <h2 style={styles.noResultsTitle}>No Results Found</h2>
                <p style={styles.noResultsText}>
                    We couldn't find any products matching your filters.
                    Try adjusting your search criteria.
                </p>
            </div>
        );
    }

    return (
        <>
            <header style={styles.header}>
                <h1 style={styles.title}>Products</h1>
                <div style={styles.controlsContainer}>
                    <div style={dropdownStyles.wrapper}>
                        <select
                            style={dropdownStyles.select}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={dropdownStyles.wrapper}>
                        <select 
                            style={dropdownStyles.select}
                            value={sortOption} 
                            onChange={handleSortChange}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={dropdownStyles.wrapper}>
                        <select
                            style={dropdownStyles.select}
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            {itemsPerPageOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <div style={styles.grid}>
                {productsToShowPaginated.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            ...styles.card,
                            ...(hoveredCard === product.id ? styles.cardHover : {})
                        }}
                        onMouseEnter={() => handleCardHover(product.id)}
                        onMouseLeave={() => handleCardHover(null)}
                    >
                        <div style={styles.imageContainer}>
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={styles.image}
                                />
                            )}
                            
                        </div>
                        <div style={styles.contentContainer}>
                            <h3 style={styles.name}>{product.name}</h3>
                            <div style={styles.priceContainer}>
                                {product.prices && product.prices.length > 0 
                                    ? product.prices.length === 1
                                        ? `${product.prices[0].current_price} BGN`
                                        : `from ${product.min_price} BGN`
                                    : 'Price not available'
                                }
                            </div>
                            
                            <div style={styles.sizesAndStoresRow}>
                                <div style={styles.sizesContainer}>
                                    <span style={styles.label}>Sizes:</span>
                                    <span style={styles.value}>
                                        {product.available_sizes?.join(", ") || 'N/A'}
                                    </span>
                                </div>
                                <span style={styles.label}>Available in:</span>
                            </div>
                            
                            <div style={styles.colorsAndAvailabilityRow}>
                                <div style={styles.colorRow}>
                                    <span style={styles.label}>Colors:</span>
                                    {console.log('Product colors:', product.available_colors)}
                                    {product.available_colors?.map((color, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.colorCircle,
                                                backgroundColor: color,
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <span style={styles.value}>
                                    {new Set(product.prices.map(p => p.merchant_name)).size} 
                                    {new Set(product.prices.map(p => p.merchant_name)).size === 1 
                                        ? ' store' 
                                        : ' stores'}
                                </span>
                            </div>
                        </div>
                        <button
                            style={{
                                ...styles.detailsButton,
                                backgroundColor: hoveredButton === product.id ? "#afcbc4" : "#000"
                            }}
                            onMouseEnter={() => setHoveredButton(product.id)}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => {
                                if (new Set(product.prices.map(p => p.merchant_name)).size === 1) {
                                    window.open(product.prices[0].merchant_store_url, '_blank', 'noopener,noreferrer');
                                } else {
                                    openModal(product);
                                }
                            }}
                        >
                            {new Set(product.prices.map(p => p.merchant_name)).size === 1
                                ? `Go to ${product.prices[0].merchant_name}`
                                : 'Compare Prices'
                            }
                        </button>
                    </div>
                ))}
            </div>

            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct}
                    onClose={closeModal}
                />
            )}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        style={{
                            ...styles.pageButton,
                            ...(currentPage === 1 ? styles.pageButtonDisabled : {})
                        }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            style={{
                                ...styles.pageButton,
                                ...(currentPage === index + 1 ? styles.pageButtonActive : {})
                            }}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        style={{
                            ...styles.pageButton,
                            ...(currentPage === totalPages ? styles.pageButtonDisabled : {})
                        }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
    
};

export default Products;
