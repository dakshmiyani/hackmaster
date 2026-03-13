const QrScanModel = require("../../models/QrScanModel");

class QrScanManager{

 static async scan(data,userId){

  const qrModel = new QrScanModel(userId);

  return qrModel.createScan(data);

 }

}

module.exports = QrScanManager;