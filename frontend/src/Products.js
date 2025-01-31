import React, { useState, useEffect } from "react";
import { productService } from './services/productService';

const Products = ({ filters }) => {
    const [products, setProducts] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const itemsPerPage = 10;
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await productService.getAllProducts();
                console.log('Fetched products:', data); 
                
                if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
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

    const applyFilters = (productsToFilter) => {
        if (!filters || !productsToFilter) return productsToFilter;

        return productsToFilter.filter(product => {
            const matchesCategory = !filters.categories.length || 
                filters.categories.map(c => c.toLowerCase()).includes(product.category_id.toString());
            
            const matchesColor = !filters.colors.length || 
                product.prices.some(p => filters.colors.includes(p.color_id?.toString()));
            
            const matchesSize = !filters.sizes.length || 
                product.prices.some(p => filters.sizes.includes(p.size_id?.toString()));
            
            const matchesBrand = !filters.brands.length || 
                filters.brands.includes(product.brand);
            
            const lowestPrice = Math.min(...product.prices.map(p => parseFloat(p.current_price)));
            const matchesPrice = !filters.maxPrice || lowestPrice <= filters.maxPrice;

            return matchesCategory && matchesColor && matchesSize && 
                   matchesBrand && matchesPrice;
        });
    };

    const productsToShow = applyFilters(products)
        .filter(product => selectedCategory === "all" || product.category_id.toString() === selectedCategory)
        .sort((a, b) => {
            if (sortOption === "lowToHigh") {
                return parseFloat(a.prices[0].current_price) - parseFloat(b.prices[0].current_price);
            } else if (sortOption === "highToLow") {
                return parseFloat(b.prices[0].current_price) - parseFloat(a.prices[0].current_price);
            }
            return 0;
        });

    const totalPages = Math.ceil(productsToShow.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: "15px 30px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        dropdown: {
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
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
            height: "400px",
            margin: "0 auto",
        },
        cardHover: {
            transform: "scale(1.05)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        },
        image: {
            width: "100%",
            height: "200px",
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
            marginTop: "auto",
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
            maxWidth: "600px",
            width: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
        },
        modalContent: {
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
        },
        modalImage: {
            flex: "1",
            maxWidth: "50%",
            borderRadius: "10px",
        },
        modalDetails: {
            flex: "2",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
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
        storeListContainer: {
            display: "block", 
            width: "100%", 
            marginTop: "20px", 
            padding: "10px",
            borderRadius: "10px", 
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            boxSizing: "border-box", 
            overflowX: "hidden", 
        },
        storeBox: {
            display: "flex",
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "#FFF",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "10px", 
            fontFamily: "'Arial', sans-serif",
            fontWeight: "bold",
            width: "100%",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", 
            boxSizing: "border-box", 
            overflowX: "hidden",
        },
        
        storeName: {
            fontSize: "18px",
            color: "#333",
            flex: "1", 
        },
        storePrice: {
            fontSize: "18px",
            color: "#333",
            flex: "1", 
            textAlign: "center", 
        },
        storeButton: {
            backgroundColor: "#AFCBC4",
            borderRadius: "5px",
            padding: "5px 10px",
            color: "#FFF",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "none",
            flex: "1", 
            textAlign: "center", 
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", 
        },
        storeButtonHover: {
            backgroundColor: "#6ca390",
            color: "white",
        },
        pagination: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "50px",
        },
        pageButton: {
            padding: "10px 20px",
            margin: "0 5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
        },
        pageButtonActive: {
            backgroundColor: "#000",
            color: "#fff",
        },
        pageButtonDisabled: {
            cursor: "not-allowed",
            backgroundColor: "#f0f0f0",
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

    return (
        <>
            <header style={styles.header}>
                <h1 style={styles.title}>Products</h1>
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
                <select style={styles.dropdown} value={sortOption} onChange={handleSortChange}>
                    <option value="">Sort by</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </header>

            <div style={styles.grid}>
                {productsToShowPaginated.map((product) => (
                <div
                    key={product.id} 
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
                        From {Math.min(...product.prices.map(p => parseFloat(p.current_price)))} BGN
                        <br />
                        Available in {product.prices.length} stores
                    </p>
                    <p style={styles.size}>
                        Available sizes: {
                            [...new Set(product.prices.map(p => p.size_id))].join(", ")
                        }
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
                        <div style={styles.modalContent}>
                            <img
                                src={selectedProduct.image || "https://via.placeholder.com/240"}
                                alt={selectedProduct.name}
                                style={styles.modalImage}
                            />
                            <div style={styles.modalDetails}>
                                <h2 style={styles.name}>{selectedProduct.name}</h2>
                                <p>{selectedProduct.description}</p>
                                <p style={styles.price}>
                                    From {Math.min(...selectedProduct.prices.map(p => parseFloat(p.current_price)))} BGN
                                    <br />
                                    Available in {selectedProduct.prices.length} stores
                                </p>
                                <p style={styles.size}>
                                    Available sizes: {
                                        [...new Set(selectedProduct.prices.map(p => p.size_id))].join(", ")
                                    }
                                </p>
                            </div>
                        </div>
                        <div style={styles.storeListContainer}>
                            {selectedProduct.prices.map((price) => (
                                <div key={price.product_store_id} style={styles.storeBox}>
                                    <span style={styles.storeName}>Store {price.product_store_id}</span>
                                    <span style={styles.storePrice}>{price.current_price} BGN</span>
                                    <a
                                        href="#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.storeButton}
                                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#6ca390")}
                                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#AFCBC4")}
                                    >
                                        Go to the store
                                    </a>
                                </div>
                            ))}
                        </div>

                                                
                    </div>
                </>
            )}
            <div style={styles.pagination}>
                <button
                    style={{
                        ...styles.pageButton,
                        ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        style={{
                            ...styles.pageButton,
                            ...(currentPage === index + 1 ? styles.pageButtonActive : {}),
                        }}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    style={{
                        ...styles.pageButton,
                        ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default Products;
