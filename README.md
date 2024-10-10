# 🚀 E-Commerce Project
## Live Demo

The project is live and can be accessed at the following link:

[🚀 E-Commerce Live Demo](https://mern-ecommerce-2-xr32.onrender.com/)


This project is a full-featured e-commerce web application, integrating MongoDB, Redis, Stripe, and robust authentication mechanisms. It includes user management, product and category management, shopping cart functionality, Stripe checkout, and an admin dashboard for sales analytics.

## Features

### Core Features
- **🗄️ MongoDB & Redis Integration:** MongoDB is used as the primary database, while Redis is implemented for caching to enhance performance and reduce load times.
- **💳 Stripe Payment Setup:** Seamlessly integrated Stripe for secure payments, supporting multiple payment methods.
- **🔐 Robust Authentication System:** Secured user authentication with JSON Web Tokens (JWT) and refresh/access token strategy for session management.
- **📝 User Signup & Login:** Easy and secure user registration and login system.
- **🛒 E-Commerce Core:**
  - **📦 Product & Category Management:** Admin can manage products and categories.
  - **🛍️ Shopping Cart Functionality:** Users can add products to their cart, modify quantities, and proceed to checkout.
  - **💰 Checkout with Stripe:** A secure checkout process with Stripe payment gateway.
  - **🏷️ Coupon Code System:** Admins can create and apply discount coupon codes.
- **👑 Admin Dashboard:** An admin portal to manage products, categories, users, and monitor sales performance.
- **📊 Sales Analytics:** Visual analytics for tracking sales and trends.

### Additional Features
- **🎨 Design with Tailwind:** Modern and responsive design implemented using Tailwind CSS.
- **🔒 Security:** Enhanced security with hashed passwords, HTTPS, and input validation.
- **🛡️ Data Protection:** Implements best practices for data protection, ensuring sensitive user data is encrypted.
- **🚀 Caching with Redis:** Cache implementation to reduce database load and optimize performance for frequently accessed data.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Caching:** Redis
- **Payments:** Stripe
- **Authentication:** JWT (Access/Refresh Tokens)
- **Frontend:** React, Tailwind CSS

## Security Features
- Passwords are securely hashed using bcrypt.
- JWT tokens are used for authentication, with both access and refresh tokens.
