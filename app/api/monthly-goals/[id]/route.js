import { connectDB } from '@/lib/db';
import MonthlyGoal from '@/models/MonthlyGoal';

// GET a specific monthly goal
export async function GET(request, { params }) {
  try {
    await connectDB();
    const monthlyGoal = await MonthlyGoal.findById(params.id);
    
    if (!monthlyGoal) {
      return new Response(JSON.stringify({ error: 'Monthly goal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(monthlyGoal), {
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

// PUT/update a monthly goal
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const monthlyGoal = await MonthlyGoal.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!monthlyGoal) {
      return new Response(JSON.stringify({ error: 'Monthly goal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(monthlyGoal), {
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

// DELETE a monthly goal
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const monthlyGoal = await MonthlyGoal.findByIdAndDelete(params.id);
    
    if (!monthlyGoal) {
      return new Response(JSON.stringify({ error: 'Monthly goal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ message: 'Monthly goal deleted successfully' }), {
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