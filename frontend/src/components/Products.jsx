import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        let res = axios.get("http://localhost:3000/api/products/products")
        console.log(res.data);
        
    }, []);

    return (
        <div>
            <h2>Products</h2>
            <ul>
                {products.map((ele, item) => (
                    <li key={item._id}>
                        {item.name} - ${item.discountedPrice}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Products;
