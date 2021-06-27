
const aws = require('aws-sdk');
const axios = require('axios');

const kinesis = new aws.Kinesis({ region: 'us-east-1' });

module.exports.handler = async () => {
  try {
    let date = new Date(); 
    const day = date.getDate().toString();
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString()
    const fullDate = `${year}-${month}-${day}`
    let hour = date.getUTCHours().toString()

    if (hour.length < 2) {
      hour = "0" + hour + "00";
    }

    else {
      hour = hour + "00";
    }

    const url = `https://apitempo.inmet.gov.br/estacao/dados/${fullDate}/${hour}`;
    const response = await axios.get(url);

    let pernambuco = response.data.filter((item) => {
      if (item.UF === 'PE') return item;
    });

    pernambuco = pernambuco.map((item) => {
      return {
        Data: JSON.stringify({
          'UF': item.UF,
          'HR_MEDICAO': item.HR_MEDICAO,
          'CD_ESTACAO': item.CD_ESTACAO,
          'DT_MEDICAO': item.DT_MEDICAO,
          'LATITUDE': item.VL_LATITUDE,
          'LONGITUDE': item.VL_LONGITUDE,
          'DC_NOME': item.DC_NOME,
          'TEM_MAX': item.TEM_MAX,
          'TEMP_INS': item.TEMP_INS,
          'UMD_INS': item.UMD_INS,
          'VEN_VEL': item.VEN_VEL,
          'PRE_INS' : item.PRE_INS,
        }),
        PartitionKey:'1'
    };
    });

    

    const putIntoKinesis = await kinesis
      .putRecords({
        StreamName: 'inmet-pe',
        Records: pernambuco,
      })
      .promise();

    console.log(putIntoKinesis);

    return {
      statusCode: 200,
      body: JSON.stringify(pernambuco),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: JSON.stringify(error),
    };
  }
};
