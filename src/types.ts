export interface SDKRequest {
  type: string;
  requestId: string;
  payload?: any;
}

export interface SDKResponse {
  type: 'response' | 'error';
  requestId: string;
  result?: any;
  error?: string;
}
