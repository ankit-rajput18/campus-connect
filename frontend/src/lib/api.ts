/**
 * API client utility for communicating with the backend.
 * Handles JWT token management, request/response formatting, and error handling.
 */

// Dynamically determine API URL based on environment and current host
function getApiBaseUrl(): string {
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.hostname : "localhost";
  const protocol = isBrowser ? window.location.protocol : "http:";

  const envUrl = import.meta.env.VITE_API_URL;

  // If the env URL is explicitly configured for localhost but the app is served from a remote host,
  // switch to the current host for mobile / LAN access.
  if (
    envUrl &&
    envUrl.includes("localhost") &&
    isBrowser &&
    host !== "localhost" &&
    host !== "127.0.0.1"
  ) {
    const url = `${protocol}//${host}:5000/api`;
    console.log(`📡 Overriding VITE_API_URL localhost for remote host -> ${url}`);
    return url;
  }

  if (envUrl) {
    console.log(`📡 API URL from env -> ${envUrl}`);
    return envUrl;
  }

  if (isBrowser) {
    const url = `${protocol}//${host}:5000/api`;
    console.log(`📡 API URL from host -> ${url}`);
    return url;
  }

  return "http://localhost:5000/api";
}

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get the JWT token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Set the JWT token in localStorage
 */
function setToken(token: string): void {
  localStorage.setItem("authToken", token);
}

/**
 * Clear the JWT token from localStorage
 */
function clearToken(): void {
  localStorage.removeItem("authToken");
}

/**
 * Make an API request to the backend
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {} } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(`🔄 ${method} ${url}`);
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data.message);
      return {
        status: response.status,
        error: data.message || "An error occurred",
        data: data as T,
      };
    }

    console.log(`✅ API Success (${response.status})`);
    return {
      status: response.status,
      data: data as T,
      message: data.message,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    console.error(`❌ Fetch Failed:`, errorMessage);
    console.error(`   URL: ${url}`);
    console.error(`   Full error:`, error);
    return {
      status: 0,
      error: errorMessage,
    };
  }
}

/**
 * Make an API request with file upload
 */
async function apiRequestWithFile<T = any>(
  endpoint: string,
  formData: FormData,
  method: string = "POST"
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: response.status,
        error: data.message || "An error occurred",
        data: data as T,
      };
    }

    return {
      status: response.status,
      data: data as T,
      message: data.message,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    return {
      status: 0,
      error: errorMessage,
    };
  }
}

// ── Auth endpoints ────────────────────────────────────────────────────────

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    authProvider: string;
  };
}

export async function register(
  payload: RegisterRequest
): Promise<ApiResponse<RegisterResponse>> {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    authProvider: string;
  };
}

export async function login(
  payload: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

interface GoogleSignInRequest {
  idToken: string;
}

interface GoogleSignInResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    authProvider: string;
    onboardingComplete: boolean;
  };
}

export async function googleSignIn(
  payload: GoogleSignInRequest
): Promise<ApiResponse<GoogleSignInResponse>> {
  return apiRequest<GoogleSignInResponse>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return apiRequest("/auth/logout", { method: "POST" });
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  semester: string;
  year: string;
  branch: string;
  college: string;
  onboardingComplete: boolean;
  authProvider: string;
  createdAt: string;
}

export async function getMe(): Promise<ApiResponse<{ user: UserProfile }>> {
  return apiRequest<{ user: UserProfile }>("/auth/me", { method: "GET" });
}

// ── User endpoints ────────────────────────────────────────────────────────

interface OnboardUserRequest {
  name: string;
  department: string;
  semester: string;
  avatar?: File;
}

export async function onboardUser(
  payload: OnboardUserRequest
): Promise<ApiResponse<{ user: UserProfile }>> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("department", payload.department);
  formData.append("semester", payload.semester);
  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  return apiRequestWithFile<{ user: UserProfile }>(
    "/users/onboard",
    formData,
    "PUT"
  );
}

interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  year?: string;
  branch?: string;
  department?: string;
  semester?: string;
  avatar?: File;
}

export async function updateProfile(
  payload: UpdateProfileRequest
): Promise<ApiResponse<{ user: UserProfile }>> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.bio) formData.append("bio", payload.bio);
  if (payload.year) formData.append("year", payload.year);
  if (payload.branch) formData.append("branch", payload.branch);
  if (payload.department) formData.append("department", payload.department);
  if (payload.semester) formData.append("semester", payload.semester);
  if (payload.avatar) formData.append("avatar", payload.avatar);

  return apiRequestWithFile<{ user: UserProfile }>(
    "/users/profile",
    formData,
    "PUT"
  );
}

export async function getMyProfile(): Promise<
  ApiResponse<{ user: UserProfile; stats: any }>
> {
  return apiRequest("/users/profile", { method: "GET" });
}

export async function getUserById(
  userId: string
): Promise<ApiResponse<{ user: UserProfile }>> {
  return apiRequest(`/users/${userId}`, { method: "GET" });
}

// ── Post endpoints ────────────────────────────────────────────────────────

interface CreatePostRequest {
  title: string;
  description: string;
  category: string;
  listingType?: string;
  condition?: string;
  contact: string;
  image?: File;
}

interface Post {
  _id: string;
  title: string;
  description: string;
  category: string;
  listingType: string;
  condition: string;
  contact: string;
  image?: string;
  author: UserProfile;
  status: string;
  views: number;
  createdAt: string;
}

export async function createPost(
  payload: CreatePostRequest
): Promise<ApiResponse<{ post: Post }>> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("listingType", payload.listingType || "exchange");
  formData.append("condition", payload.condition || "Good");
  formData.append("contact", payload.contact);
  if (payload.image) {
    formData.append("image", payload.image);
  }

  return apiRequestWithFile<{ post: Post }>("/posts", formData, "POST");
}

interface GetPostsParams {
  category?: string;
  search?: string;
  sort?: "recent" | "trending" | "hot";
  page?: number;
  limit?: number;
  status?: string;
}

export async function getPosts(
  params?: GetPostsParams
): Promise<
  ApiResponse<{
    posts: Post[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("category", params.category);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sort) searchParams.append("sort", params.sort);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/posts?${queryString}` : "/posts";

  return apiRequest(endpoint, { method: "GET" });
}

export async function getPostById(
  postId: string
): Promise<ApiResponse<{ post: Post }>> {
  return apiRequest(`/posts/${postId}`, { method: "GET" });
}

export async function getMyPosts(): Promise<
  ApiResponse<{ posts: Post[] }>
> {
  return apiRequest("/posts/user/my", { method: "GET" });
}

export async function sendInterest(
  postId: string,
  message?: string
): Promise<ApiResponse<{ interested: boolean; count: number; request?: any }>> {
  return apiRequest(`/posts/${postId}/interest`, {
    method: "POST",
    body: { message },
  });
}

export async function respondToRequest(
  postId: string,
  requestId: string,
  action: "accept" | "reject"
): Promise<ApiResponse<{ request: any; post: any }>> {
  return apiRequest(`/posts/${postId}/requests/${requestId}/respond`, {
    method: "POST",
    body: { action },
  });
}

export interface Notification {
  postId: string;
  postTitle: string;
  postImage?: string;
  requestId: string;
  requester: {
    _id: string;
    name: string;
    avatar: string;
    college?: string;
    department?: string;
  };
  message?: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt?: string;
}

export async function getNotifications(): Promise<
  ApiResponse<{ notifications: Notification[]; pendingCount: number }>
> {
  return apiRequest("/posts/user/notifications", { method: "GET" });
}

interface UpdatePostRequest {
  title?: string;
  description?: string;
  category?: string;
  listingType?: string;
  condition?: string;
  contact?: string;
  status?: string;
  image?: File;
}

export async function updatePost(
  postId: string,
  payload: UpdatePostRequest
): Promise<ApiResponse<{ post: Post }>> {
  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.category) formData.append("category", payload.category);
  if (payload.listingType) formData.append("listingType", payload.listingType);
  if (payload.condition) formData.append("condition", payload.condition);
  if (payload.contact) formData.append("contact", payload.contact);
  if (payload.status) formData.append("status", payload.status);
  if (payload.image) formData.append("image", payload.image);

  return apiRequestWithFile<{ post: Post }>(
    `/posts/${postId}`,
    formData,
    "PUT"
  );
}

export async function deletePost(
  postId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}

export async function updatePostStatus(
  postId: string,
  status: string
): Promise<ApiResponse<{ post: Post }>> {
  return apiRequest(`/posts/${postId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function togglePostInterest(
  postId: string
): Promise<ApiResponse<{ interested: boolean }>> {
  return apiRequest(`/posts/${postId}/interest`, {
    method: "POST",
  });
}

// ── Chat endpoints ────────────────────────────────────────────────────────

export interface Chat {
  _id: string;
  participants: UserProfile[];
  unread: number;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser: UserProfile;
  unreadCounts?: Record<string, number>;
}

export interface ChatMessage {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getChats(): Promise<ApiResponse<{ chats: Chat[] }>> {
  return apiRequest<{ chats: Chat[] }>("/chats", { method: "GET" });
}

export async function findOrCreateChat(
  recipientId: string
): Promise<ApiResponse<{ chat: Chat }>> {
  return apiRequest<{ chat: Chat }>("/chats", {
    method: "POST",
    body: { recipientId },
  });
}

export async function getMessages(
  chatId: string,
  page: number = 1,
  limit: number = 50
): Promise<ApiResponse<{ messages: ChatMessage[] }>> {
  return apiRequest<{ messages: ChatMessage[] }>(
    `/chats/${chatId}/messages?page=${page}&limit=${limit}`,
    { method: "GET" }
  );
}

export async function sendMessage(
  chatId: string,
  text: string
): Promise<ApiResponse<{ message: ChatMessage }>> {
  return apiRequest<{ message: ChatMessage }>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: { text },
  });
}


// ── Token management ────────────────────────────────────────────────────────

export function handleAuthSuccess(token: string): void {
  setToken(token);
  localStorage.setItem("userLoggedIn", "true");
}

export function handleLogout(): void {
  clearToken();
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("cachedUser");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── User cache helpers ───────────────────────────────────────────────────────
// Persist the user object in localStorage so the navbar avatar shows
// instantly on refresh without waiting for getMe() to resolve.

export function setCachedUser(user: any): void {
  localStorage.setItem("cachedUser", JSON.stringify(user));
}

export function getCachedUser(): any | null {
  try {
    const raw = localStorage.getItem("cachedUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Call this after any profile update.
 * Saves the new user to localStorage AND fires a "user-updated" event
 * so AppShell refreshes the navbar avatar immediately without a page reload.
 */
export function notifyUserUpdated(user: any): void {
  setCachedUser(user);
  window.dispatchEvent(new CustomEvent("user-updated", { detail: user }));
}
