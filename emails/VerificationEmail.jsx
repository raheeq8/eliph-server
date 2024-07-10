const { Html, Head, Font, Preview, Heading, Row, Section, Text } = require('@react-email/components');

const VerificationEmail = ({ name, otp }) => {
  return (
    Html({
      lang: 'en',
      dir: 'ltr',
      children: [
        Head({
          children: [
            '<title>Eliph store Verification Code</title>',
            Font({
              fontFamily: 'Roboto',
              fallbackFontFamily: 'Verdana',
              webFont: {
                url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                format: 'woff2',
              },
              fontWeight: 400,
              fontStyle: 'normal',
            }),
          ],
        }),
        Preview({
          children: `Here &apos;s your verification code: ${otp}`,
        }),
        Section({
          children: [
            Row({
              children: Heading({
                as: 'h2',
                children: `Hello ${name}`,
              }),
            }),
            Row({
              children: Text({
                children: 'Thank you for registering, Please use the following verification code to complete your registration:',
              }),
            }),
            Row({
              children: Text({
                children: otp,
              }),
            }),
            Row({
              children: Text({
                children: 'If you did not request this code, please ignore this email.',
              }),
            }),
          ],
        }),
      ],
    })
  );
};

module.exports = { VerificationEmail };
