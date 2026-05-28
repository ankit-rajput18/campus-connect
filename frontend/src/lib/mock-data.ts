export type Category = "Books" | "Notes" | "Electronics" | "Hostel Essentials" | "Others";
export type PostStatus = "Available" | "Exchanged" | "Pending";

export interface Post {
  id: string;
  title: string;
  description: string;
  category: Category;
  image: string;
  student: string;
  studentId?: string;
  avatar: string;
  college: string;
  postedAt: string;
  status: PostStatus;
  userRequestStatus?: "Pending" | "Accepted" | "Rejected" | null;
}

export interface College {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  address?: string;
  students: number;
  featured?: boolean;
  hasLogo?: boolean;
}

export const COLLEGE_NAME = "Dr. D. Y. Patil Institute of Technology";
export const COLLEGE_SHORT = "DYP DPU";
export const COLLEGE_CITY = "Pune";
export const COLLEGE_ADDRESS = "Sant Tukaram Nagar, Pimpri Colony, Pune, Pimpri-Chinchwad";

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "Engineering Mathematics Vol. 2",
    description: "B.S. Grewal textbook, like-new condition. Used for one semester only.",
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    student: "Aarav Patil",
    avatar: "https://i.pravatar.cc/100?img=12",
    college: COLLEGE_NAME,
    postedAt: "2h ago",
    status: "Available",
  },
  {
    id: "2",
    title: "DSA Handwritten Notes",
    description: "Complete data structures notes covering trees, graphs, DP with examples.",
    category: "Notes",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    student: "Sneha Joshi",
    avatar: "https://i.pravatar.cc/100?img=47",
    college: COLLEGE_NAME,
    postedAt: "5h ago",
    status: "Available",
  },
  {
    id: "3",
    title: "Scientific Calculator (Casio fx-991EX)",
    description: "Barely used, perfect for engineering math. Comes with cover.",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=800&q=80",
    student: "Rohan Deshmukh",
    avatar: "https://i.pravatar.cc/100?img=33",
    college: COLLEGE_NAME,
    postedAt: "1d ago",
    status: "Pending",
  },
  {
    id: "4",
    title: "Study Lamp + Desk Organizer",
    description: "Moving out — combo deal. Great for hostel rooms.",
    category: "Hostel Essentials",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    student: "Priya Sharma",
    avatar: "https://i.pravatar.cc/100?img=44",
    college: COLLEGE_NAME,
    postedAt: "2d ago",
    status: "Available",
  },
  {
    id: "5",
    title: "Drafting Board (A2)",
    description: "First-year engineering drawing board with all clips and scale.",
    category: "Others",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
    student: "Karan Mehta",
    avatar: "https://i.pravatar.cc/100?img=15",
    college: COLLEGE_NAME,
    postedAt: "3d ago",
    status: "Exchanged",
  },
  {
    id: "6",
    title: "Operating Systems — Galvin",
    description: "9th edition, no markings inside. Selling at half price.",
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    student: "Isha Kulkarni",
    avatar: "https://i.pravatar.cc/100?img=23",
    college: COLLEGE_NAME,
    postedAt: "4d ago",
    status: "Available",
  },
  {
    id: "7",
    title: "Wireless Mouse + Keyboard",
    description: "Logitech combo, used for 6 months, works perfectly.",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    student: "Vivek Rane",
    avatar: "https://i.pravatar.cc/100?img=51",
    college: COLLEGE_NAME,
    postedAt: "5d ago",
    status: "Available",
  },
  {
    id: "8",
    title: "Mini Fridge for Hostel",
    description: "Compact, low power, perfect for snacks and drinks.",
    category: "Hostel Essentials",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
    student: "Neha Patil",
    avatar: "https://i.pravatar.cc/100?img=20",
    college: COLLEGE_NAME,
    postedAt: "1w ago",
    status: "Pending",
  },
];

export const categories: Category[] = ["Books", "Notes", "Electronics", "Hostel Essentials", "Others"];

// Single college — the entire platform is built for DYP DPU
export const colleges: College[] = [
  {
    id: "dyp-dpu",
    name: COLLEGE_NAME,
    shortName: COLLEGE_SHORT,
    city: COLLEGE_CITY,
    address: COLLEGE_ADDRESS,
    students: 0,
    featured: true,
    hasLogo: true,
  },
];

/* ─── Chat data ─────────────────────────────────────────────────────────── */
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  department: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

const ME = "me";

export const mockChats: ChatThread[] = [
  {
    id: "c1", userId: "u1", name: "Sneha Joshi", avatar: "https://i.pravatar.cc/100?img=47",
    department: "Computer Engineering", lastMessage: "Is the DSA notes still available?",
    lastTime: "2m ago", unread: 2, online: true,
    messages: [
      { id: "m1", senderId: "u1", text: "Hey! Is the DSA notes still available?", time: "10:32 AM", read: true },
      { id: "m2", senderId: ME, text: "Yes it is! You can pick it up from the library.", time: "10:34 AM", read: true },
      { id: "m3", senderId: "u1", text: "Great! Can we meet tomorrow at 11 AM?", time: "10:35 AM", read: true },
      { id: "m4", senderId: "u1", text: "Is the DSA notes still available?", time: "10:40 AM", read: false },
    ],
  },
  {
    id: "c2", userId: "u2", name: "Rohan Deshmukh", avatar: "https://i.pravatar.cc/100?img=33",
    department: "Electronics & Telecommunication", lastMessage: "Thanks for the calculator!",
    lastTime: "1h ago", unread: 0, online: true,
    messages: [
      { id: "m1", senderId: ME, text: "Hi Rohan, is the Casio calculator still available?", time: "9:00 AM", read: true },
      { id: "m2", senderId: "u2", text: "Yes! Come to Block C at 4 PM.", time: "9:05 AM", read: true },
      { id: "m3", senderId: ME, text: "Perfect, see you then!", time: "9:06 AM", read: true },
      { id: "m4", senderId: "u2", text: "Thanks for the calculator!", time: "9:45 AM", read: true },
    ],
  },
  {
    id: "c3", userId: "u3", name: "Priya Sharma", avatar: "https://i.pravatar.cc/100?img=44",
    department: "Mechanical Engineering", lastMessage: "I'll bring it to college tomorrow.",
    lastTime: "3h ago", unread: 1, online: false,
    messages: [
      { id: "m1", senderId: "u3", text: "Hi! Interested in the study lamp combo.", time: "7:00 AM", read: true },
      { id: "m2", senderId: ME, text: "Sure! It's in great condition.", time: "7:10 AM", read: true },
      { id: "m3", senderId: "u3", text: "I'll bring it to college tomorrow.", time: "7:15 AM", read: false },
    ],
  },
  {
    id: "c4", userId: "u4", name: "Karan Mehta", avatar: "https://i.pravatar.cc/100?img=15",
    department: "Civil Engineering", lastMessage: "Can you lower the price a bit?",
    lastTime: "1d ago", unread: 0, online: false,
    messages: [
      { id: "m1", senderId: "u4", text: "Hey, saw your drafting board listing.", time: "Yesterday", read: true },
      { id: "m2", senderId: "u4", text: "Can you lower the price a bit?", time: "Yesterday", read: true },
      { id: "m3", senderId: ME, text: "I can do ₹200 off. Final offer!", time: "Yesterday", read: true },
    ],
  },
  {
    id: "c5", userId: "u5", name: "Isha Kulkarni", avatar: "https://i.pravatar.cc/100?img=23",
    department: "Information Technology", lastMessage: "Sent you the payment screenshot.",
    lastTime: "2d ago", unread: 0, online: false,
    messages: [
      { id: "m1", senderId: "u5", text: "I want the OS Galvin book.", time: "2 days ago", read: true },
      { id: "m2", senderId: ME, text: "Sure, it's ₹250.", time: "2 days ago", read: true },
      { id: "m3", senderId: "u5", text: "Sent you the payment screenshot.", time: "2 days ago", read: true },
    ],
  },
];
