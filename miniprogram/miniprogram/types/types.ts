export interface Product {
  id: string;
  name: string;
  description: string;
  url: string;
  sn: string;
  price: number;
};

export interface CartItem extends Product {
  quantity: number;
};

export interface UserInfo {
  openid: string;
  phone: string;
  name: string;
  avatar: string;
}

export interface Address {
  id: number,
  name: string,
  address: string,
}

export interface Order {
  id: string,
  created_at: string,
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sn: string;
  }[], 
  status: string, 
  total_price: number,
  invoice: string,
  user_address: string,
  user_name: string,
  user_phone: string
}