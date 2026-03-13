const BaseModel = require("./libs/BaseModel");

class OrganizationModel extends BaseModel {

    constructor(userId) {
        super(userId);
        this.table = "organizations";
    }

    async create({ name, email, website, logo_url }) {

        const db = await this.getQueryBuilder();

        const insertData = this.insertStatement({
            name,
            email,
            website,
            logo_url
        });

        const [org] = await db(this.table)
            .insert(insertData)
            .returning("*");

        return org;
    }

    async findByEmail(email) {

        const db = await this.getQueryBuilder();

        return db(this.table)
            .where(this.whereStatement({ email }))
            .first();
    }

    async getAll() {

        const db = await this.getQueryBuilder();

        return db(this.table)
            .where(this.whereStatement());

    }

}

module.exports = OrganizationModel;