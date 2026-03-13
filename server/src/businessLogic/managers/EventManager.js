const EventModel = require("../../models/EventModel");

class EventManager{

 static async createEvent(data,userId){

  const eventModel = new EventModel(userId);

  return eventModel.create(data);

 }

 static async getEvents(){

  const eventModel = new EventModel();

  return eventModel.getAll();

 }

}

module.exports = EventManager;