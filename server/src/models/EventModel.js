const BaseModel = require("./libs/BaseModel");

class EventModel extends BaseModel{

 constructor(userId){
  super(userId);
  this.table="events";
 }

 async create({organization_id,name,start_date,end_date}){

  const db = await this.getQueryBuilder();

  const insertData = this.insertStatement({
   organization_id,
   name,
   start_date,
   end_date
  });

  const [event] = await db(this.table)
  .insert(insertData)
  .returning("*");

  return event;
 }

  async findByNameNormalized(name) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
      .where(this.whereStatement())
      .first();
  }

  async findById(id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ event_id: id }))
      .first();
  }

  async getAll(){
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(this.whereStatement());
  }

}

module.exports = EventModel;