// ... existing code ...
const fetchItems = async () => {
  try {
    setLoading(true);
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    // ... query params setup ...
    
    // Update this line to use the API_URL constant or directly use port 5003
    const res = await axios.get(`${API_URL}/api/items?${queryParams.toString()}`);
    setItems(res.data.data);
  } catch (err) {
    // ... error handling ...
  } finally {
    setLoading(false);
  }
};
// ... existing code ...