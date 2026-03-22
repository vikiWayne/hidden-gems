export type APISuccessResponse<T> = {
  status: "success";
  data: T;
};

export type APIErrorResponse = {
  status: "error";
  error: {
    code: string;
    message: string;
    requestId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
  };
};

export type APIResponseHandler<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};
