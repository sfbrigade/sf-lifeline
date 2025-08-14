export type Hospital = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
};

export type NpiResult = {
  name: string;
  address: string;
  phone: string;
  npi: string;
};
