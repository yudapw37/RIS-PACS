// Standarisasi Response Format untuk Frontend JSON
export const sendResponse = (
  set: any,
  code: number,
  msg: string,
  data: any = null
) => {
  set.status = code;
  return {
    code,
    msg,
    data
  };
};
