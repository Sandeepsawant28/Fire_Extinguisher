const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to calculate status
const calculateStatus = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'OVERDUE';
  if (diffDays <= 30) return 'DUE THIS MONTH';
  if (diffDays <= 90) return 'DUE ~3 MO';
  return 'UP TO DATE';
};

// GET all extinguishers with optional filters
app.get('/api/extinguishers', async (req, res) => {
  try {
    const { floor, status } = req.query;
    let query = supabase.from('extinguishers').select('*').order('created_at', { ascending: false });

    if (floor && floor !== 'All Floors') {
      query = query.eq('floor', floor);
    }
    if (status && status !== 'All Status') {
      query = query.eq('status', status.toUpperCase());
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new extinguisher
app.post('/api/extinguishers', async (req, res) => {
  try {
    const extinguisher = req.body;
    extinguisher.status = calculateStatus(extinguisher.due_date);
    
    const { data, error } = await supabase
      .from('extinguishers')
      .insert([extinguisher])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT edit existing
app.put('/api/extinguishers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.status = calculateStatus(updates.due_date);
    updates.updated_at = new Date();

    const { data, error } = await supabase
      .from('extinguishers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
app.delete('/api/extinguishers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('extinguishers').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH mark as refilled
app.patch('/api/extinguishers/:id/refill', async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const updates = {
      last_refilled: today.toISOString().split('T')[0],
      due_date: nextYear.toISOString().split('T')[0],
      status: 'UP TO DATE',
      updated_at: today
    };

    const { data, error } = await supabase
      .from('extinguishers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
