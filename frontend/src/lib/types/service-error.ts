export type ServiceErrorCategory = 
  | 'General' 
  | 'Authentication' 
  | 'Token' 
  | 'Password' 
  | 'Database' 
  | 'Validation' 
  | 'Product' 
  | 'Image';

export interface ServiceError {
  errorCode: string;
  message: string;
  statusCode: number;
  category: ServiceErrorCategory;
  errors?: Record<string, string[]>;
}