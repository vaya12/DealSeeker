import React, { useState, useEffect, useMemo } from "react";
import { productService } from './services/productService';

const groupProducts = (products) => {
    const groupedProducts = {};
    
    products.forEach(product => {
        const key = `${product.name}_${product.brand}`; 
        
        if (!groupedProducts[key]) {
            groupedProducts[key] = {
                ...product,
                prices: [...product.prices],
                available_sizes: new Set(product.available_sizes),
                available_colors: new Set(product.available_colors)
            };
        } else {
            groupedProducts[key].prices = [
                ...groupedProducts[key].prices,
                ...product.prices
            ];
            
            product.available_sizes.forEach(size => 
                groupedProducts[key].available_sizes.add(size)
            );
            
            product.available_colors.forEach(color => 
                groupedProducts[key].available_colors.add(color)
            );
            
            const allPrices = groupedProducts[key].prices.map(p => parseFloat(p.current_price));
            groupedProducts[key].min_price = Math.min(...allPrices).toFixed(2);
            groupedProducts[key].max_price = Math.max(...allPrices).toFixed(2);
        }
    });

    return Object.values(groupedProducts).map(product => ({
        ...product,
        available_sizes: Array.from(product.available_sizes),
        available_colors: Array.from(product.available_colors)
    }));
};

const Products = ({ filters }) => {
    const [products, setProducts] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [clickedButton, setClickedButton] = useState(null);
    const [noResults, setNoResults] = useState(false);

    const itemsPerPageOptions = [
        { value: 5, label: '5 products' },
        { value: 10, label: '10 products' },
        { value: 15, label: '15 products' },
        { value: 20, label: '20 products' }
    ];

    const filteredProducts = useMemo(() => {
        console.log('Current filters:', filters);
        console.log('All products:', products);
        
        if (!products.length) return [];

        return products.filter(product => {
            // Category filter
            const categoryMatch = filters.categories.length === 0 || 
                filters.categories.some(category => 
                    product.category_name.toLowerCase() === category.toLowerCase()
                );

            // Color filter
            const colorMatch = filters.colors.length === 0 || 
                filters.colors.some(filterColor => 
                    product.available_colors.some(productColor => 
                        productColor.toLowerCase() === filterColor.toLowerCase()
                    )
                );

            // Size filter
            const sizeMatch = filters.sizes.length === 0 || 
                filters.sizes.some(filterSize => 
                    product.available_sizes.includes(filterSize)
                );

            // Brand filter
            const brandMatch = filters.brands.length === 0 || 
                filters.brands.some(brand => 
                    product.brand.toLowerCase() === brand.toLowerCase()
                );

            // Price filter
            const productPrice = parseFloat(product.min_price);
            const priceMatch = 
                (!filters.minPrice || productPrice >= filters.minPrice) && 
                (!filters.maxPrice || productPrice <= filters.maxPrice);

            console.log(`Product ${product.name} matches:`, {
                categoryMatch,
                colorMatch,
                sizeMatch,
                brandMatch,
                priceMatch
            });

            // Product must match ALL active filters
            return categoryMatch && colorMatch && sizeMatch && brandMatch && priceMatch;
        });
    }, [products, filters]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await productService.getAllProducts();
                
                if (data && Array.isArray(data.products)) {
                    const groupedProducts = groupProducts(data.products);
                    setProducts(groupedProducts);
                } else {
                    setError('Invalid data format received from server');
                    console.error('Invalid data format:', data);
                }
            } catch (error) {
                setError(error.message);
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const hasNoResults = filteredProducts.length === 0;
        console.log('No results:', hasNoResults);
        setNoResults(hasNoResults);
    }, [filteredProducts]);

    const categories = [
        { label: "Sort by category:", value: "all" },
        { label: "Clothes", value: "clothes" },
        { label: "Bags", value: "bags" },
        { label: "Shoes", value: "shoes" },
        { label: "Accessories", value: "accessories" },
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
        .filter(product => selectedCategory === "all" || 
            product.category_name.toLowerCase() === selectedCategory.toLowerCase())
        .sort((a, b) => {
            if (sortOption === "lowToHigh") {
                return parseFloat(a.min_price) - parseFloat(b.min_price);
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
            alignItems: "center",
            marginBottom: "20px",
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
            border: "1px solid #ddd",
            borderRadius: "15px",
            overflow: "hidden",
            cursor: "pointer",
            textAlign: "center",
            padding: "15px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            backgroundColor: "#f9f9f9",
            width: "270px",
            height: "450px",
            margin: "0 auto",
        },
        cardHover: {
            transform: "scale(1.05)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        },
        imageContainer: {
            width: "100%",
            height: "250px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "10px",
            marginBottom: "10px",
            position: "relative",
        },
        image: {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "10px",
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
            padding: "10px 20px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
            marginTop: "auto",
            transition: "all 0.3s ease",
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", 
            zIndex: 999,
        },
        modal: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "5px",
            borderRadius: "20px",
            zIndex: 1000,
            width: "90%",
            maxWidth: "800px",
            maxHeight: "70vh",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            borderStyle: "solid",
            borderColor: "#afcbc4",
            borderWidth: "thick"
        },
        modalContent: {
            display: "flex",
            gap: "30px",
            marginBottom: "20px"
        },
        modalLeftSection: {
            flex: "0 0 40%"
        },
        modalRightSection: {
            flex: "1"
        },
        modalImage: {
            width: "100%",
            height: "350px",
            objectFit: "contain",
            backgroundColor: "#f8f8f8",
            borderRadius: "15px",
            padding: "10px",
        },
        productTitle: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#1a1a1a",
        },
        productDescription: {
            fontSize: "14px",
            color: "#666",
            lineHeight: "1.5",
            marginBottom: "15px",
        },
        priceInfo: {
            fontSize: "20px",
            color: "#1a1a1a",
            fontWeight: "500",
            marginBottom: "20px",
        },
        sizesContainer: {
            marginBottom: "10px",
            textAlign: "center"
        },
        sizesTitle: {
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "5px",
            color: "#333"
        },
        sizesList: {
            fontSize: "14px",
            color: "#666",
            margin: "0"
        },
        storesSection: {
            marginTop: "15px",
        },
        storesTitle: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#1a1a1a",
        },
        storeBox: {
            width: "100%",
            maxWidth: "600px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            alignItems: "center",
            padding: "15px",
            backgroundColor: "#f8f8f8",
            borderRadius: "10px",
            gap: "15px"
        },
        storeName: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#1a1a1a",
        },
        storePrice: {
            fontSize: "16px",
            color: "#6CA390",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        originalPrice: {
            textDecoration: "line-through",
            color: "#999",
            fontSize: "14px",
        },
        storeButton: {
            padding: "8px 16px",
            backgroundColor: "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "all 0.2s ease",
            width: "100%",
            textAlign: "center",
        },
        closeButton: {
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#666",
            padding: "5px",
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
        colorsContainer: {
            margin: "10px 0",
            textAlign: "center",
            width: "100%"
        },
        colorsTitle: {
            fontSize: "14px",
            color: "#000",
            marginBottom: "8px",
            fontWeight: "bold"
        },
        colorsWrapper: {
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
            padding: "0 15px"
        },
        colorCircle: {
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
            "&:hover": {
                transform: "scale(1.1)"
            }
        },
        modalColorsContainer: {
            marginTop: "15px",
            padding: "15px",
            textAlign: "center",
            backgroundColor: "#f8f8f8",
            borderRadius: "12px",
        },
        modalColorCircle: {
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
            "&:hover": {
                transform: "scale(1.1)"
            }
        },
        modalSectionTitle: {
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "12px",
            textAlign: "center"
        },
        storeInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        saleLogo: {
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            animation: 'pulse 2s infinite'
        },
        '@keyframes pulse': {
            '0%': {
                transform: 'scale(1)'
            },
            '50%': {
                transform: 'scale(1.1)'
            },
            '100%': {
                transform: 'scale(1)'
            }
        },
        controlsContainer: {
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap"
        },
        dropdown: {
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            backgroundColor: "#fff",
            fontSize: "14px",
            cursor: "pointer",
            minWidth: "150px",
            "&:hover": {
                borderColor: "#999"
            },
            "&:focus": {
                outline: "none",
                borderColor: "#666"
            }
        },
        cardSaleLogo: {
            position: 'absolute',
            top: '0px',
            right: '10px',
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            animation: 'pulse 2s infinite'
        },
        modalStoresSection: {
            width: "100%",
            borderTop: "1px solid #eee",
            paddingTop: "30px",
            marginTop: "auto"
        },
        storesGrid: {
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center"
        },
        storesCount: {
            fontSize: "14px",
            color: "#666",
            margin: "5px 0",
            fontStyle: "italic"
        },
        noResults: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px",
            textAlign: "center"
        },
        noResultsTitle: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#1a1a1a"
        },
        noResultsText: {
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.5"
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
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
                    <select
                        style={styles.dropdown}
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        style={styles.dropdown} 
                        value={sortOption} 
                        onChange={handleSortChange}
                    >
                        <option value="">Sort by</option>
                        <option value="lowToHigh">Price: Low to High</option>
                        <option value="highToLow">Price: High to Low</option>
                    </select>

                    <select
                        style={styles.dropdown}
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value="all">Products per page</option>
                        {itemsPerPageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div style={styles.grid}>
                {productsToShowPaginated.map((product) => {
                    const hasMultipleStores = product.prices.length > 1;
                    const singleStore = !hasMultipleStores ? product.prices[0] : null;

                    return (
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
                                <img
                                    src={product.image || "https://via.placeholder.com/200x200"}
                                    alt={product.name}
                                    style={styles.image}
                                />
                                {product.prices.some(price => 
                                    parseFloat(price.current_price) < parseFloat(price.original_price)
                                ) && (
                                    <img 
                                        src="/sale_logo.png" 
                                        alt="Sale" 
                                        style={styles.cardSaleLogo}
                                    />
                                )}
                            </div>
                            <h3 style={styles.name}>{product.name}</h3>
                            <p style={styles.price}>
                                From {product.min_price} BGN
                                {product.min_price !== product.max_price && ` - ${product.max_price} BGN`}
                            </p>
                            <p style={styles.storesCount}>
                                Available in {product.prices.length} {product.prices.length === 1 ? 'store' : 'stores'}
                            </p>
                            <div style={styles.sizesContainer}>
                                <p style={styles.sizesTitle}>Available sizes:</p>
                                <p style={styles.sizesList}>
                                    {product.available_sizes.join(", ")}
                                </p>
                            </div>
                            <div style={styles.colorsContainer}>
                                <p style={styles.colorsTitle}>Available colors:</p>
                                <div style={styles.colorsWrapper}>
                                    {product.available_colors.map((color, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.colorCircle,
                                                backgroundColor: color,
                                                border: color === '#FFFFFF' ? '1px solid #ddd' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                style={{
                                    ...styles.detailsButton,
                                    ...(hoveredButton === product.id ? {
                                        backgroundColor: "#afcbc4",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                    } : {}),
                                    ...(clickedButton === product.id ? {
                                        transform: "translateY(0)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        backgroundColor: "#afcbc4"
                                    } : {})
                                }}
                                onMouseEnter={() => setHoveredButton(product.id)}
                                onMouseLeave={() => setHoveredButton(null)}
                                onMouseDown={() => setClickedButton(product.id)}
                                onMouseUp={() => setClickedButton(null)}
                                onClick={hasMultipleStores 
                                    ? () => openModal(product)
                                    : () => window.open(singleStore.website_url, '_blank', 'noopener,noreferrer')
                                }
                            >
                                {hasMultipleStores 
                                    ? 'Product Details'
                                    : `Go to ${singleStore.name}`
                                }
                            </button>
                        </div>
                    );
                })}
            </div>

            
            {selectedProduct && (
                <>
                <div style={styles.modalOverlay} onClick={closeModal}></div>
                <div style={styles.modal}>
                    <button style={styles.closeButton} onClick={closeModal}>
                        &times;
                    </button>
                    
                    <div style={styles.modalContent}>
                        <div style={styles.modalLeftSection}>
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                style={styles.modalImage}
                            />
                        </div>

                        <div style={styles.modalRightSection}>
                            <h2 style={styles.productTitle}>{selectedProduct.name}</h2>
                            <p style={styles.productDescription}>{selectedProduct.description}</p>
                            
                            <div style={styles.sizesContainer}>
                                <h3 style={styles.modalSectionTitle}>Available sizes:</h3>
                                <p style={styles.sizesList}>
                                    {selectedProduct.available_sizes.join(", ")}
                                </p>
                            </div>

                            <div style={styles.modalColorsContainer}>
                                <h3 style={styles.modalSectionTitle}>Available colors:</h3>
                                <div style={styles.colorsWrapper}>
                                    {selectedProduct.available_colors.map((color, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.modalColorCircle,
                                                backgroundColor: color,
                                                border: color === '#FFFFFF' ? '1px solid #ddd' : 'none'
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.modalStoresSection}>
                        <h3 style={styles.storesTitle}>Available in these stores:</h3>
                        <div style={styles.storesGrid}>
                            {selectedProduct.prices.map((price, index) => (
                                <div key={index} style={styles.storeBox}>
                                    <div style={styles.storeInfo}>
                                        <span style={styles.storeName}>{price.name}</span>
                                        {parseFloat(price.current_price) < parseFloat(price.original_price) && (
                                            <img 
                                                src="/sale_logo.png" 
                                                alt="Sale" 
                                                style={styles.saleLogo}
                                            />
                                        )}
                                    </div>
                                    <span style={styles.storePrice}>
                                        {price.current_price} BGN
                                        {price.original_price !== price.current_price && (
                                            <span style={styles.originalPrice}>
                                                {price.original_price} BGN
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        style={styles.storeButton}
                                        onClick={() => window.open(price.website_url, '_blank')}
                                    >
                                        Go to the store
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </>
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
