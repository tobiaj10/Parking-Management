import { 
  users, type User, type InsertUser,
  tickets, type Ticket, type InsertTicket, type UpdateTicket,
  garageSettings, type GarageSettings, type InsertGarageSettings
} from "@shared/schema";
import { db } from './db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

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

export class DatabaseStorage implements IStorage {
  // Initialize with default settings if needed
  constructor() {
    // Ensure default garage settings exist
    this.initializeDefaultSettings();
  }

  // Initialize default garage settings if none exist
  private async initializeDefaultSettings(): Promise<void> {
    const settings = await this.getGarageSettings();
    if (!settings) {
      await this.createOrUpdateGarageSettings({
        totalSpaces: 140,
        hourlyRate: 1000 // $10 in cents
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber));
    return ticket;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    // The actual insertTicket schema only includes licensePlate and vehicleType
    // We need to add the additional fields before inserting
    const ticketToInsert = {
      ...insertTicket,
      ticketNumber: `PS-${Math.floor(1000 + Math.random() * 9000)}`,
      entryTime: new Date(),
      status: 'active'
    };
    
    const [ticket] = await db.insert(tickets).values(ticketToInsert).returning();
    return ticket;
  }

  async updateTicket(id: number, updateData: UpdateTicket): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    
    return updatedTicket;
  }

  async getActiveTickets(): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.status, 'active'));
  }

  async getRecentTickets(limit: number): Promise<Ticket[]> {
    return db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.entryTime))
      .limit(limit);
  }

  // Garage settings operations
  async getGarageSettings(): Promise<GarageSettings | undefined> {
    const [settings] = await db.select().from(garageSettings);
    return settings;
  }

  async createOrUpdateGarageSettings(settings: InsertGarageSettings): Promise<GarageSettings> {
    const existingSettings = await this.getGarageSettings();
    
    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(garageSettings)
        .set(settings)
        .where(eq(garageSettings.id, existingSettings.id))
        .returning();
      
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(garageSettings)
        .values(settings)
        .returning();
      
      return newSettings;
    }
  }

  // Stats operations
  async getOccupiedSpacesCount(): Promise<number> {
    const activeTickets = await this.getActiveTickets();
    return activeTickets.length;
  }

  async getTodayRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ sum: sql<number>`COALESCE(sum(${tickets.amountPaid}), 0)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'completed'),
          gte(tickets.exitTime, today)
        )
      );
    
    return result[0]?.sum || 0;
  }

  async getVehiclesProcessedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const processed = await db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'completed'),
          gte(tickets.exitTime, today)
        )
      );
    
    return processed.length;
  }

  async getAverageStayTime(): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`COALESCE(avg(${tickets.durationMinutes}), 0)` })
      .from(tickets)
      .where(eq(tickets.status, 'completed'));
    
    return Math.round(result[0]?.avg || 0);
  }
}

export const storage = new DatabaseStorage();
