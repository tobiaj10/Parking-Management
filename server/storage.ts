import { 
  users, type User, type InsertUser,
  tickets, type Ticket, type InsertTicket, type UpdateTicket,
  garageSettings, type GarageSettings, type InsertGarageSettings
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: UpdateTicket): Promise<Ticket | undefined>;
  getActiveTickets(): Promise<Ticket[]>;
  getRecentTickets(limit: number): Promise<Ticket[]>;
  
  // Garage settings operations
  getGarageSettings(): Promise<GarageSettings | undefined>;
  createOrUpdateGarageSettings(settings: InsertGarageSettings): Promise<GarageSettings>;
  
  // Stats operations
  getOccupiedSpacesCount(): Promise<number>;
  getTodayRevenue(): Promise<number>;
  getVehiclesProcessedToday(): Promise<number>;
  getAverageStayTime(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private settings: GarageSettings | undefined;
  private currentUserId: number;
  private currentTicketId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentSettingsId = 1;
    
    // Initialize with default garage settings
    this.settings = {
      id: this.currentSettingsId,
      totalSpaces: 140,
      hourlyRate: 1000 // $10.00 in cents
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(
      (ticket) => ticket.ticketNumber === ticketNumber
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticket: Ticket = { 
      ...insertTicket, 
      id,
      exitTime: null,
      durationMinutes: null,
      amountPaid: null,
      paymentMethod: null
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: number, updateData: UpdateTicket): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket: Ticket = { ...ticket, ...updateData };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getActiveTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.status === 'active'
    );
  }

  async getRecentTickets(limit: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
      .sort((a, b) => {
        const aTime = a.exitTime || a.entryTime;
        const bTime = b.exitTime || b.entryTime;
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, limit);
  }

  // Garage settings operations
  async getGarageSettings(): Promise<GarageSettings | undefined> {
    return this.settings;
  }

  async createOrUpdateGarageSettings(settings: InsertGarageSettings): Promise<GarageSettings> {
    this.settings = { 
      ...settings, 
      id: this.currentSettingsId
    };
    return this.settings;
  }

  // Stats operations
  async getOccupiedSpacesCount(): Promise<number> {
    return (await this.getActiveTickets()).length;
  }

  async getTodayRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.tickets.values())
      .filter(ticket => {
        if (!ticket.exitTime || !ticket.amountPaid) return false;
        const exitDate = new Date(ticket.exitTime);
        return exitDate >= today;
      })
      .reduce((sum, ticket) => sum + (ticket.amountPaid || 0), 0);
  }

  async getVehiclesProcessedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.tickets.values())
      .filter(ticket => {
        if (!ticket.exitTime) return false;
        const exitDate = new Date(ticket.exitTime);
        return exitDate >= today;
      })
      .length;
  }

  async getAverageStayTime(): Promise<number> {
    const completedTickets = Array.from(this.tickets.values())
      .filter(ticket => ticket.status === 'completed' && ticket.durationMinutes);
    
    if (completedTickets.length === 0) return 0;
    
    const totalMinutes = completedTickets.reduce(
      (sum, ticket) => sum + (ticket.durationMinutes || 0), 
      0
    );
    
    return totalMinutes / completedTickets.length;
  }
}

export const storage = new MemStorage();
