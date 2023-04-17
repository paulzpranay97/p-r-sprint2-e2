const express=require("express")


const {BlogModel}=require("../model/blog.model")
const blogRouter=express.Router()
const jwt=require("jsonwebtoken")


blogRouter.get("/blogs", async (req,res)=>{
    try{const data = await BlogModel.find();
 
     res.send(data);
     }catch (err) {
         console.log(err);
         res.status(500).send("Internal server error");
       }
   })




blogRouter.post("/create", async (req, res) => {
    const payload = req.body;
    try {
      const posts = new BlogModel(payload);
     
      res.status(200).send(await posts.save());
    } catch (err) {
      res.status(400).send({ msg: "Post is not created", err: err.message });
      
    }
    
  });





blogRouter.patch("/update/:id", async (req,res) =>{
    const id = req.params.id;
    const change = req.body;
  
    const note = await BlogModel.findOne({ _id: id });
    const user_id_in_blog = note.userID;
    const user_id_req = req.body.userID;
  
    try {
      if (user_id_req !== user_id_in_blog) {
        res.send({ msg: "you are not authorized" });
      } else {
        await BlogModel.findByIdAndUpdate({ _id: id }, change);
        res.send("update the data");
      }
    } catch (error) {
      res.send({ msg: "something went wrong", error: error.message });
      console.log(error)
    }
})





blogRouter.delete("/delete/:id", async (req,res) =>{
    const id = req.params.id;
    const change = req.body;
  
    const note = await BlogModel.findOne({ _id: id });
    const user_id_in_Blog = note.userID;
    const user_id_req = req.body.userID;
  
    try {
      if (user_id_req !== user_id_in_Blog) {
        res.send({ msg: "you are not authorized" });
      } else {
        const posts=await BlogModel.findByIdAndDelete({ _id: id }, change)
       
        res.send(posts);
      }
    } catch (error) {
      res.send({ msg: "something went wrong", error: error.message });
      console.log(error)
    }
})





blogRouter.get("/own/:id", async (req, res) => {
  const id = req.params.id;
  try {
  const data= await BlogModel.find({ _id: id });
    res.send(data)

  } catch (err) {
    res.send(err);
  }
});



  

module.exports={
    blogRouter
}