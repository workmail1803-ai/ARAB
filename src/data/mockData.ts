// Mock data for the Dispatch Dashboard

export interface Agent {
    id: string;
    name: string;
    phone: string;
    status: "Free" | "Busy" | "Inactive";
    avatarUrl?: string;
    batteryLevel: number;
    tasksCount: number;
}

export interface Task {
    id: string;
    customerName: string;
    address: string;
    type: "Pickup" | "Delivery";
    status: "Unassigned" | "Assigned" | "Completed";
    timeWindow: string;
    assignedAgent?: string;
}

// Mock Agents Data
export const MOCK_AGENTS: Agent[] = [
    {
        id: "agent-1",
        name: "Nafis",
        phone: "+880 1756-003283",
        status: "Inactive",
        batteryLevel: 85,
        tasksCount: 0,
    },
    {
        id: "agent-2",
        name: "Mike Rodriguez",
        phone: "+1 555-123-4567",
        status: "Busy",
        batteryLevel: 72,
        tasksCount: 3,
    },
    {
        id: "agent-3",
        name: "Lisa Kim",
        phone: "+1 555-234-5678",
        status: "Free",
        batteryLevel: 95,
        tasksCount: 0,
    },
    {
        id: "agent-4",
        name: "Tom Wilson",
        phone: "+1 555-345-6789",
        status: "Busy",
        batteryLevel: 45,
        tasksCount: 2,
    },
    {
        id: "agent-5",
        name: "Sarah Chen",
        phone: "+1 555-456-7890",
        status: "Free",
        batteryLevel: 88,
        tasksCount: 0,
    },
    {
        id: "agent-6",
        name: "John Davis",
        phone: "+1 555-567-8901",
        status: "Inactive",
        batteryLevel: 12,
        tasksCount: 0,
    },
];

// Mock Tasks Data
export const MOCK_TASKS: Task[] = [
    {
        id: "TK-1234",
        customerName: "John Smith",
        address: "123 Main St, Downtown",
        type: "Delivery",
        status: "Unassigned",
        timeWindow: "10:00 AM - 12:00 PM",
    },
    {
        id: "TK-1235",
        customerName: "Sarah Johnson",
        address: "456 Oak Ave, Midtown",
        type: "Pickup",
        status: "Assigned",
        timeWindow: "11:00 AM - 1:00 PM",
        assignedAgent: "agent-2",
    },
    {
        id: "TK-1236",
        customerName: "David Brown",
        address: "789 Pine Rd, Uptown",
        type: "Delivery",
        status: "Unassigned",
        timeWindow: "2:00 PM - 4:00 PM",
    },
    {
        id: "TK-1237",
        customerName: "Emily Davis",
        address: "321 Elm St, Westside",
        type: "Delivery",
        status: "Completed",
        timeWindow: "9:00 AM - 11:00 AM",
        assignedAgent: "agent-3",
    },
    {
        id: "TK-1238",
        customerName: "Michael Wilson",
        address: "654 Maple Dr, Eastside",
        type: "Pickup",
        status: "Assigned",
        timeWindow: "3:00 PM - 5:00 PM",
        assignedAgent: "agent-4",
    },
    {
        id: "TK-1239",
        customerName: "Jennifer Lee",
        address: "987 Cedar Ln, Suburb",
        type: "Delivery",
        status: "Unassigned",
        timeWindow: "4:00 PM - 6:00 PM",
    },
    {
        id: "TK-1240",
        customerName: "Robert Taylor",
        address: "159 Birch Blvd, Central",
        type: "Pickup",
        status: "Completed",
        timeWindow: "8:00 AM - 10:00 AM",
        assignedAgent: "agent-2",
    },
];
