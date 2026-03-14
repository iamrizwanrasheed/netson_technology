const BASE_URL = "https://netsontech.com/wp-json/netson/v1";
const JWT_URL = "https://netsontech.com/wp-json/jwt-auth/v1";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
interface JWTResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export async function login(username: string, password: string) {
  const res = await fetch(
    `${JWT_URL}/token?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    { method: "POST" }
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Invalid credentials" }));
    throw new Error(error.message || "Invalid credentials");
  }
  const data: JWTResponse = await res.json();
  localStorage.setItem("auth_token", data.token);

  // Fetch full profile after login
  const profile = await getProfile();
  return profile;
}

export function logout() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("auth_token");
}

// Utility: API returns URLs with escaped slashes like "https:\/\/..." — strip them
function cleanUrl(url: string): string {
  return url ? url.replace(/\\\//g, "/") : "";
}

function cleanProfile(profile: UserProfile): UserProfile {
  profile.avatar = cleanUrl(profile.avatar);
  if (profile.calendar_url) profile.calendar_url = cleanUrl(profile.calendar_url);
  if (profile.calendar_embed_code) profile.calendar_embed_code = profile.calendar_embed_code.replace(/\\\//g, "/");
  return profile;
}

// Profile
export interface UserProfile {
  id: number;
  display_name: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
  role: string;
  calendar_url?: string;
  calendar_embed_code?: string;
  call_agent_api_key?: string;
}

export async function getProfile(): Promise<UserProfile> {
  const profile = await request<UserProfile>("/profile");
  // console.log("RIZWAN PROFILE :",profile);
  return cleanProfile(profile);
}

export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email?: string;
  calendar_embed_code?: string;
}): Promise<UserProfile> {
  const profile = await request<UserProfile>("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return cleanProfile(profile);
}

export async function updatePassword(password: string): Promise<void> {
  return request("/profile/avatar", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// Orders
export interface OrderProject {
  phase: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  line_total: string;
  product_id: number;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  created_at: string;
  project: OrderProject;
}

export interface OrderDetail extends Order {
  subtotal: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  page: number;
  per_page: number;
  orders: Order[];
}

export async function getActiveOrder(): Promise<any> {
  return request<any>("/active-order");
}

export async function getOrders(page = 1): Promise<OrdersResponse> {
  return request<OrdersResponse>(`/my-orders?page=${page}`);
}

export async function getOrderDetail(id: number): Promise<OrderDetail> {
  return request<OrderDetail>(`/my-orders/${id}`);
}
