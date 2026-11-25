// Scrisori pentru Bubu — the settings of the site. This is the only file to
// change when the Google Form changes (see "The Google Form" in README.md).

export const FORM = {
  // the address the form sends its answers to: the form's link with
  // "viewform" replaced by "formResponse"
  action: 'https://docs.google.com/forms/d/e/1FAIpQLSclFUm4usIJESvH1PEWi4RxkjpxpDwDf_7hy0j5CwjV73FjqA/formResponse',
  // the id of every question of the form
  fields: {
    message: 'entry.1036479831', // "Mesajul pentru Bubu" (paragraph)
    name: 'entry.1406855150', // "Numele tău" (short answer, optional)
  },
};

export const LIMITS = {
  // the most letters a message / a name may have (also set them in the
  // form: Response validation → Length → Maximum character count)
  message: 1000,
  name: 40,
  // how long to wait for Google before saying the letter did not go
  timeoutSeconds: 20,
};
