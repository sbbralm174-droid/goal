import { connectDB } from '@/lib/db';
import MonthlyGoal from '@/models/MonthlyGoal';

// GET all monthly goals
export async function GET() {
  try {
    await connectDB();
    const monthlyGoals = await MonthlyGoal.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(monthlyGoals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST a new monthly goal
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const monthlyGoal = await MonthlyGoal.create(body);
    return new Response(JSON.stringify(monthlyGoal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}