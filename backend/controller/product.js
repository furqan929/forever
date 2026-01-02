const Product = require("../model/Product");
const Wishlist = require("../model/Wishlist");
const User = require("../model/Auth"); // ForeverUser


exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 12
    } = req.query;


    console.log(search, category);


    // Build query object
    let query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    // 0 = 0 => 0
    // 1 = 1 => 0
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: products.length,
        totalProducts: total
      }
    });
  }

  catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    })
  }
};


exports.getProductsById = async (req, res) => {
  const id = req.params.id
  const products = await Product.findById(id)

  if (!products) {
    res.send({ message: "Product Not Found" })
  }

  res.send(products)

}

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  // console.log(rating,comment);

  const productId = req.params.id;


  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Please login to add a review.' });
  }

  const userId = req.user.id;



  try {
    const product = await Product.findById(productId)
      .populate({
        path: 'reviews.user',
        select: 'name email',
      });
    // console.log(product,"product");

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user._id.toString() === userId);
    // console.log(alreadyReviewed,"review");

    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this product' });

    product.reviews.push({ user: userId, rating, comment });
    product.calculateRating(); // Update the product's rating
    await product.save();

    res.status(201).json({ message: 'Review added successfully', reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "reviews.user",
      select: "name email",
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

exports.wishList = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }


    // Find logged in user
    let user = await User.findById(req.user.id);

    // console.log(user);


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product already exists in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed To Add WishList" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ message: "Unauthorized" });
    }
    // console.log(req.user);


    const user = await User.findById(req.user.id).populate("wishlist")

    if (!user.wishlist || !user || user.wishlist.length == 0) {
      return res.json({ message: "Wishlist is empty", products: [] });
    }

    // console.log(user.wishlist);
    return res.json(user.wishlist);
  } catch (error) {
    return res.json({ message: "Error fetching wishlist", error: error.message });
  }
};


exports.deleteWishlist = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // filter out the item
    user.wishlist = user.wishlist.filter((ele) => ele.toString() !== id);

    await user.save();

    return res.json({
      message: "Item removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error in Server" });
  }
};


exports.getCategories = async (req, res) => {
  try {
    let Category = await Product.distinct("category")

    res.send({ categories: Category })
  }
  catch (err) {
    res.send(err)
  }
}

exports.getBrand = async (req, res) => {
  try {
    let Brand = await Product.distinct("brand")
    res.send({ brand: Brand })
  }
  catch (err) {
    res.send(err)
  }
}



// /////////////////////////////////////




exports.createProduct = async (req, res) => {
  const { name, description, price, brand, category, stock, discountedPrice ,image} = req.body;

  try {

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      brand,
      stock,
      discountedPrice,
      image
    });

    const createdProduct = await newProduct.save();
    console.log("Product created:", createdProduct);

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};



exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, stock, category, brand } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};