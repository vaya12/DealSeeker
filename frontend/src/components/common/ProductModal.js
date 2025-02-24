import React from 'react';

const ProductModal = ({ product, onClose }) => {
    const styles = {
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
            maxWidth: "1000px",
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
            flexDirection: "column",
            padding: "20px",
            maxHeight: "80vh",
            overflowY: "auto"
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
            textAlign: "center",
        },
        storeInfo: {
            display: "flex",
            alignItems: "center",
            gap: "10px"
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
            maxHeight: "400px",
            overflowY: "auto"
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
        productTitle: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#1a1a1a",
        },
        saleLogo: {
            width: "40px",
            height: "40px",
            objectFit: "contain",
            animation: "pulse 2s infinite"
        },
        "@keyframes pulse": {
            '0%': {
                transform: "scale(1)"
            },
            '50%': {
                transform: "scale(1.1)"
            },
            '100%': {
                transform: "scale(1)"
            }
        },
        sizesColorsContainer: {
            display: 'flex',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            gap: '20px',
            padding: '15px',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
            marginBottom: '20px',
            justifyContent: 'center',
            alignItems: 'center',
        },
        sizeSection: {
            flex: '1',
            minWidth: window.innerWidth <= 480 ? '100%' : '45%',
            textAlign: 'center',
        },
        colorSection: {
            flex: '1',
            minWidth: window.innerWidth <= 480 ? '100%' : '45%',
            textAlign: 'center',
        },
        sizeTitle: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '12px',
            textAlign: 'center',
        },
        sizesWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
        },
        sizeTag: {
            padding: '4px 12px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
        },
        colorsWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
        },
        colorCircle: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            border: '1px solid #ddd',
        },
    };

    return (
        <>
            <div style={styles.modalOverlay} onClick={onClose}></div>
            <div style={{
                ...styles.modal,
                width: '90%',
                maxWidth: '1200px',
                margin: '20px auto',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <button style={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                
                <div style={styles.modalContent}>
                    <h2 style={{
                        ...styles.productTitle, 
                        marginBottom: '20px',
                        fontSize: 'clamp(18px, 2vw, 24px)',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '15px'
                    }}>
                        {product.name}
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                        gap: '30px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            flex: window.innerWidth <= 768 ? '1' : '0 0 40%'
                        }}>
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '500px',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        <div style={{
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            <div>
                                <p style={{
                                    fontSize: 'clamp(14px, 1.5vw, 16px)',
                                    color: '#333',
                                    lineHeight: '1.5',
                                    marginBottom: '20px'
                                }}>
                                    {product.description}
                                </p>

                                <div style={styles.sizesColorsContainer}>
                                    <div style={styles.sizeSection}>
                                        <h3 style={styles.sizeTitle}>Available sizes:</h3>
                                        <div style={styles.sizesWrapper}>
                                            {product.available_sizes.map((size, index) => (
                                                <span key={index} style={styles.sizeTag}>
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={styles.colorSection}>
                                        <h3 style={styles.sizeTitle}>Available colors:</h3>
                                        <div style={styles.colorsWrapper}>
                                            {product.available_colors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        ...styles.colorCircle,
                                                        backgroundColor: color,
                                                        border: color.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none',
                                                    }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{
                                    fontSize: 'clamp(16px, 1.8vw, 18px)',
                                    marginBottom: '15px'
                                }}>
                                    Available in these stores:
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {product.prices.map((price, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                                            justifyContent: 'space-between',
                                            alignItems: window.innerWidth <= 480 ? 'stretch' : 'center',
                                            padding: '12px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '8px',
                                            gap: window.innerWidth <= 480 ? '10px' : '0'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <span style={{fontSize: '14px'}}>{price.store_name}</span>
                                                {parseFloat(price.current_price) < parseFloat(price.original_price) && (
                                                    <img src="/sale_logo.png" alt="Sale" style={styles.saleLogo} />
                                                )}
                                            </div>
                                            
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px',
                                                justifyContent: window.innerWidth <= 480 ? 'space-between' : 'flex-end'
                                            }}>
                                                <span style={{
                                                    fontSize: '16px',
                                                    fontWeight: '500'
                                                }}>
                                                    {price.current_price} BGN
                                                    {price.original_price !== price.current_price && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            fontSize: '14px',
                                                            color: '#999',
                                                            textDecoration: 'line-through'
                                                        }}>
                                                            {price.original_price} BGN
                                                        </span>
                                                    )}
                                                </span>
                                                <button
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#000',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        minWidth: '120px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.3s ease',
                                                        ':hover': {
                                                            backgroundColor: '#afcbc4',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                        }
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#afcbc4';
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#000';
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    onClick={() => window.open(price.website_url, '_blank', 'noopener,noreferrer')}
                                                >
                                                    Go to store
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductModal; 