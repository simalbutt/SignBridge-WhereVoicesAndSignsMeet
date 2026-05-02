import API from "./axios";

export const convertTextToGloss = (text) => {
  return API.post("/text-to-gloss/convert/", {
    text: text
  });
};

export const batchConvertTextToGloss = (texts) => {
  return API.post("/text-to-gloss/batch-convert/", {
    texts: texts
  });
};