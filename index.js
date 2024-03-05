require('./db/config')
const models = require('./db/models')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const secret = 'e-comm'

const app = express()
app.use(express.json())
app.use(cors())


app.get('/',verifyToken,async(req,resp)=>{

   const result =await models.user.find()
   resp.send(result)
})

app.post('/register',async(req,resp)=>{
if(req.body.email&&req.body.password&&req.body.name){
   const data = await new models.user(req.body)
   let result = await data.save()
   result = result.toObject()
   delete result.password
   jwt.sign({result}, secret, { expiresIn: '1h' },(error,token)=>{
      resp.json({
         statusCode:200,
         statusMessage:"New user Created",
         data:result,
         token
      })
   })
     
}
else{
   resp.json({
      statusCode:203,
      statusMessage:"Please fill all details",
   })
}
})

app.post('/login',async(req,resp)=>{
   if(req.body.email && req.body.password){
      let result = await models.user.findOne(req.body).select('-password')
      if(result){
         jwt.sign({result}, secret, { expiresIn: '1h' },(error,token)=>{
         resp.json({
            statusCode:200,
            statusMessage:"User Found",
            data:result,
            token:token
         })
      })   
      }
      else{
         resp.json({
            statusCode:203,
            statusMessage:"Please enter correct email or password",
         })
      }
   }
   else{
      resp.json({
         statusCode:404,
         statusMessage:"Please enter correct email or password",
      })
   }
})

app.post('/add-product',verifyToken,async(req,resp)=>{
   if(req.body.name&&req.body.price&&req.body.category&&req.body.userId&&req.body.company){
      let data = await new models.product(req.body)
      let result = await data.save()
      resp.json({
         statusCode:200,
         statusMessage:'Product added successfully',
         data:result
      })
   }
   else{
      resp.json({
         statusCode:203,
         statusMessage:'Please fill all details',
      })
   }
})

app.get('/products',verifyToken,async(req,resp)=>{

   let result = await models.product.find()
   if(result?.length>0){
      resp.json({
         statusCode:200,
         statusMessage:'Products found',
         data:result
      })
   }
   else{
      resp.json({
         statusCode:200,
         statusMessage:'No products found',
         data:[]
      })
   }
})

app.delete('/product/:id',verifyToken,async(req,resp)=>{
   let result = await models.product.deleteOne({_id:req.params.id})
   if(result.deletedCount>0)
   resp.json({
      statusCode:200,
      statusMessage:'Deleted successfully'
   })
   else{
      resp.json({
         statusCode:403,
         statusMessage:'No item found'
      })
   }
})

app.put('/product/:id',verifyToken,async(req,resp)=>{
   let result = await models.product.updateOne(
      {_id:req.params.id},
      {$set:req.body}
   )
if(result){
   resp.json({
      statusCode:200,
      statusMessage:'Product updated successfully',
      data:result
   })
}
else{
   resp.json({
      statusCode:500,
      statusMessage:'Something went wrong! Please try again later',
   })
}
})

app.get('/search/:key',verifyToken,async(req,resp)=>{
   let result = await models.product.find({
      "$or":[
         {name:{$regex:req.params.key,$options: 'i'}},
         {company:{$regex:req.params.key,$options: 'i'}},
         {category:{$regex:req.params.key,$options: 'i'}}
      ]
   })
   resp.json({
      statusCode:200,
      statusMessage:'Products Found',
      data:result
   })
})

function verifyToken(req, resp, next) {
   let token = req.headers.authorization?.split(' ')[1]
  if(token){
     jwt.verify(token,secret,(error,valid)=>{
        if(error){
          resp.json({
           statusCode:401,
           statusMessage:'Invalid Token'
        })
        }
        else{
           next()
        }
     })
  }
  else{
   resp.status(403).json({
      statusCode:403,
      statusMessage:'Please send token'
   })
  }
}



app.listen(5000)