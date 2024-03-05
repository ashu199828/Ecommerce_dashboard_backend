const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
   {
      name: String,
      email: {
          type: String,
          required: true
      },
      password: {
          type: String,
          required: true
      }
  }
)

const productsSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
     },
      price: {
          type: Number,
          required: true
      },
      category: {
          type: String,
          required: true
      },
      userId: {
         type: String,
         required: true
     },
     company: {
      type: String,
      required: true
  }
  }
)

module.exports ={
   user:mongoose.model('users',userSchema),
   product:mongoose.model('products',productsSchema),
}