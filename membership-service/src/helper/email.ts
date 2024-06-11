const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_GRID_API)

const SendMail = async (msg) => {
  const response = await sgMail.send(msg);
  console.log(response)
  return response; 
};

export  { SendMail };