import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Products.css'; 
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Products = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: '', image: '' });
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        image: '',
        quantity: 0,
        deliveryAddress: '',
    });
    const [editingProduct, setEditingProduct] = useState(null); 
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false); 

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/categories')
            .then((response) => setCategories(response.data))
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        axios
            .get(`http://localhost:5000/api/products/${category._id}`)
            .then((response) => setProducts(response.data))
            .catch((error) => console.error('Error fetching products:', error));
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/categories', newCategory);
            setCategories([...categories, response.data]);
            setNewCategory({ name: '', image: '' });
            setIsCategoryModalOpen(false); 
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!selectedCategory) {
            alert('Please select a category before adding a product');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/products', { ...newProduct, category: selectedCategory._id });
            setProducts([...products, response.data]);
            setNewProduct({
                name: '',
                price: '',
                image: '',
                quantity: 0,
                deliveryAddress: '',
            });
            setIsProductModalOpen(false);
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product');
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, editingProduct);
            setProducts(products.map((product) =>
                product._id === editingProduct._id ? response.data : product
            ));
            setIsEditProductModalOpen(false); 
            setEditingProduct(null); 
        } catch (error) {
            console.error('Error editing product:', error);
            alert('Error editing product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${productId}`);
            setProducts(products.filter((product) => product._id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
            setCategories(categories.filter((category) => category._id !== categoryId));
            setProducts([]); // Clear products when a category is deleted
            setSelectedCategory(null); // Deselect category
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product); 
        setIsEditProductModalOpen(true); 
    };

    return (
        <div className="products-container">
            <div className="categories-section">
                <div className="section-header">
                    <button className="add-category-button" onClick={() => setIsCategoryModalOpen(true)}>
                        <FaPlus /> 
                    </button>
                    <h2> Categories</h2>
                </div>
                <ul className="categories-list">
                    {categories.map((category) => (
                        <li
                            key={category._id}
                            className={selectedCategory && selectedCategory._id === category._id ? 'active-category' : ''}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <img src={category.image} alt={category.name} className="category-image" />
                            <span>{category.name}</span>
                            <button onClick={() => handleDeleteCategory(category._id)} className="delete-category-button">
                                <FaTrash /> Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal to Add Category */}
            {isCategoryModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <form className="add-category-form" onSubmit={handleAddCategory}>
                            <h3>Add New Category</h3>
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Category Image URL"
                                value={newCategory.image}
                                onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                                required
                            />
                            <button type="submit"><FaPlus /> Add Category</button>
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="products-section">
                <div className="section-header">
                    <button className="add-product-button" onClick={() => setIsProductModalOpen(true)}>
                        <FaPlus /> 
                    </button>
                    <h2>Products in {selectedCategory ? selectedCategory.name : ''}</h2>
                </div>
                <ul className="products-list">
                    {products.map((product) => (
                        <li key={product._id} className="product-item">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-details">
                                <p>Quantity: {product.quantity}</p>
                                <div className="product-actions">
                                    <button onClick={() => handleEditClick(product)}>
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product._id)}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal to Add Product */}
            {isProductModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <form className="add-product-form" onSubmit={handleAddProduct}>
                            <h3>Add New Product</h3>
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={newProduct.image}
                                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={newProduct.quantity}
                                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Delivery Address"
                                value={newProduct.deliveryAddress}
                                onChange={(e) => setNewProduct({ ...newProduct, deliveryAddress: e.target.value })}
                                required
                            />
                            <button type="submit"><FaPlus /> Add Product</button>
                            <button type="button" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal to Edit Product */}
            {isEditProductModalOpen && editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <form className="add-product-form" onSubmit={handleEditProduct}>
                            <h3>Edit Product</h3>
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={editingProduct.image}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={editingProduct.quantity}
                                onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Delivery Address"
                                value={editingProduct.deliveryAddress}
                                onChange={(e) => setEditingProduct({ ...editingProduct, deliveryAddress: e.target.value })}
                                required
                            />
                            <button type="submit"><FaEdit /> Save Changes</button>
                            <button type="button" onClick={() => setIsEditProductModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
