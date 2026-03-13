const BaseModel = require("./libs/BaseModel");

class MealModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "meals";
  }

  async getAllowedMealsForEvent(event_id) {
    const db = await this.getQueryBuilder();

    // Join meals and event_meals to get allowed meals for an event
    return db(this.table)
      .join("event_meals", "meals.meal_id", "event_meals.meal_id")
      .where("event_meals.event_id", event_id)
      .select("meals.meal_type", "meals.meal_id");
  }

}

module.exports = MealModel;