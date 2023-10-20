const nodemailer = require("nodemailer");
//const { options } = require("../routes/tourRouters");

const sendEmail = async options => {
    //1 create transporter 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT*1,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        //activate in gmail"less secure app" option

    });
    //2 defiine the email options

    const mailOptions = {
        from: "thejasvi e s",
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html
    };

    //3 Actually sending the email happens here
    await transporter.sendMail(mailOptions);
    // try {
    //     await transporter.sendMail(mailOptions);
    //     console.log("Email sent successfully."); // Add this for debugging
    // } catch (error) {
    //     console.error("Error sending email:", error); // Add this for debugging
    //     throw error; // Rethrow the error so it can be caught by the caller
    // }

};

module.exports = sendEmail;