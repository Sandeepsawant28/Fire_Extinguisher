
import axios from 'axios';

const testBackend = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/extinguishers');
    console.log('GET /extinguishers:', res.status, res.data);
  } catch (err) {
    console.error('GET /extinguishers failed:', err.response ? err.response.data : err.message);
  }

  try {
    const res = await axios.post('http://localhost:5000/api/extinguishers', {
      serial_id: 'TEST-001',
      type: 'ABC (DRY POWDER)',
      floor: 'Ground Floor',
      wing: 'Test Wing',
      location_detail: 'Test Location',
      last_refilled: '2023-01-01',
      due_date: '2024-01-01'
    });
    console.log('POST /extinguishers:', res.status, res.data);
  } catch (err) {
    console.error('POST /extinguishers failed:', err.response ? err.response.data : err.message);
  }
};

testBackend();
