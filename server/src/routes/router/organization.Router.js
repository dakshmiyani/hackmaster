const express = require("express");
const router = express.Router();
const OrganizationManager = require("../../businessLogic/managers/OrganizationManager")

router.post("/create", async (req,res)=>{
  try{

    const data = await OrganizationManager.createOrganization(
      req.body,
     
    );

    res.json({
      success:true,
      data
    });

  }catch(err){
    res.status(400).json({success:false,message:err.message});
  }
});

router.get("/all", async(req,res)=>{
  try{

    const data = await OrganizationManager.getOrganizations();

    res.json({success:true,data});

  }catch(err){
    res.status(400).json({success:false,message:err.message});
  }
});

module.exports = router;