const OrganizationModel = require("../../models/OrganizationModel");

class OrganizationManager{

 static async createOrganization(data,userId){

  const orgModel = new OrganizationModel(userId);

  return orgModel.create(data);

 }

 static async getOrganizations(){

  const orgModel = new OrganizationModel();

  return orgModel.getAll();

 }

}

module.exports = OrganizationManager;