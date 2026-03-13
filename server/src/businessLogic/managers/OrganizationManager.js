const OrganizationModel = require("../../models/OrganizationModel");

class OrganizationManager {

  static async createOrganization(data, userId) {

    const orgModel = new OrganizationModel(userId);

    // Check if organization with same email already exists
    const existing = await orgModel.findByEmail(data.email);

    if (existing) {
      throw new Error("Organization already exists with this email");
    }

    // Create organization
    return orgModel.create(data);

  }

  static async getOrganizations() {

    const orgModel = new OrganizationModel();

    return orgModel.getAll();

  }

}

module.exports = OrganizationManager;