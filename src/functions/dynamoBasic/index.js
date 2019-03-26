'use strict';

module.exports.dynamo = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Dynamo Rocks!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Dynamo Rocks!', event };
};
