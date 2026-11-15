export type Lang = "fr" | "ar";

export type ServiceId = string;

export interface PlateService {
  id: ServiceId;
  /** Unit price in MAD */
  price: number;
  /** Previous price shown struck-through, optional */
  compareAtPrice?: number | undefined;
  active: boolean;
  /** Estimated delivery delay in hours */
  leadTimeHours: number;
  name?: string | undefined;
  description?: string | undefined;
  nameFr?: string | undefined;
  nameAr?: string | undefined;
  descriptionFr?: string | undefined;
  descriptionAr?: string | undefined;
  imageUrl?: string | null | undefined;
}

export interface CartItem {
  serviceId: ServiceId;
  quantity: number;
}

export interface OrderLine extends CartItem {
  unitPrice: number;
  serviceName?: string | undefined;
}

export type OrderStatus =
  | "pending"
  | "documents_review"
  | "confirmed"
  | "in_production"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DocumentType = "cin_front" | "cin_back" | "carte_grise";
export type DocumentStatus = "pending" | "approved" | "rejected";

export interface OrderDocument {
  id?: number | undefined;
  type: DocumentType;
  fileName: string;
  mimeType?: string | undefined;
  sizeBytes?: number | undefined;
  contentUrl?: string | undefined;
  sizeKb: number;
  status: DocumentStatus;
  rejectionReason?: string | undefined;
}

export type PaymentMethod = "bank_transfer" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface Payment {
  id?: number | undefined;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string | undefined;
  paidAt?: string | undefined;
}

export type DeliveryStatus = "unscheduled" | "scheduled" | "in_transit" | "delivered" | "failed";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Delivery {
  id?: number | undefined;
  address: string;
  neighborhood: string;
  instructions?: string | undefined;
  location?: GeoPoint | undefined;
  status: DeliveryStatus;
  scheduledFor?: string | undefined;
  driver?: string | undefined;
}

export interface AdminDelivery {
  id: number;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  city: string;
  neighborhood: string;
  address: string;
  instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: DeliveryStatus;
  scheduledAt?: string | null;
  driver?: string | null;
}

export interface Customer {
  fullName: string;
  phone: string;
  email?: string | undefined;
}

export interface PlateNumber {
  /** Serial digits, 1 to 5 digits */
  serial: string;
  /** Arabic series letter */
  letter: string;
  /** Prefecture / region code (1-89) */
  region: string;
}

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  plate: PlateNumber;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: Delivery;
  documents: OrderDocument[];
  payment: Payment;
  notes?: string | undefined;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

/** Guest checkout payload sent as multipart/form-data to Laravel. */
export interface CreateOrderPayload {
  customer: Customer;
  plate: PlateNumber;
  items: CartItem[];
  delivery: Pick<Delivery, "address" | "neighborhood" | "instructions" | "location">;
  documents: (Pick<OrderDocument, "type" | "fileName" | "sizeKb"> & { file: File })[];
  paymentMethod: PaymentMethod;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  pendingDocuments: number;
  deliveriesToday: number;
  averageBasket: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  statusBreakdown: { status: OrderStatus; count: number }[];
}
