export type OrderItem = {
    id: string;
    userId: string;
    orderId: number;
    catalogId: number;
    catalogName: string;
    catalogCode?: string;
    orderResponse:string
  };
  

  export type OrderDetail = {
    orderId: number;
    orderDetailId: number;
    instanceName: string;
    orderDetail:string
  };
  